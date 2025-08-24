<?php

namespace App\Authentication\Identifier\Ldap;

use ArrayObject;
use Cake\ORM\Locator\LocatorAwareTrait;
use Authentication\Identifier\Ldap\ExtensionAdapter as BaseExtensionAdapter;

class CustomExtensionAdapter extends BaseExtensionAdapter {

    // Use the LocatorAwareTrait to get access to the table locator
    use LocatorAwareTrait;
    
    protected $username_prefix = 'ldap_';

  /*  public function authenticate($username, $password) {
        // Modify this function to fix the issue
        return parent::authenticate($username, $password);
    }*/


    //We create a connect_new function instead of connect in order to allow the last parameter (optional) to be tls flag
    public function connect_new(string $host, int $port, array $options,bool $tls): void {

        $this->_setErrorHandler();
        $proto = 'ldap';
        
        if($tls == true){
            $proto = 'ldaps';
        }
        $connect_string = $proto.'://'.$host.':'.$port;
        
        $resource = ldap_connect($connect_string);
               
        if ($resource === false) {               
            throw new RuntimeException('Unable to connect to LDAP server.');
        }else{
            // Set LDAP options (recommended for proper functionality)
            ldap_set_option($resource, LDAP_OPT_PROTOCOL_VERSION, 3);
            ldap_set_option($resource, LDAP_OPT_REFERRALS, 0);
        
        }
      /*  if (isset($options['tls']) && $options['tls']) {
            //convert the connection to TLS
            if (!ldap_start_tls($resource)) {
                throw new RuntimeException('Starting TLS failed on connection to LDAP server.');
            }
        }*/
        unset($options['tls']); //don't pass through to PHP LDAP functions
        $this->_connection = $resource;
        $this->_unsetErrorHandler();

        foreach ($options as $option => $value) {
            $this->setOption($option, $value);
        }
    }
    
     
    public function advbind(string $username , string $password , array $cfg )
    {
       
        $admin_dn       = $cfg['admin_dn'];
        $admin_pw       = $cfg['admin_pw'];
        $base_dn        = $cfg['base_dn'];
        $filter         = $cfg['filter'];
        $search_filter  = sprintf($filter, ldap_escape($username, '', LDAP_ESCAPE_FILTER));
        
        $this->_setErrorHandler();
        // Bind as admin to perform search
        $admin_bind_result  = ldap_bind($this->getConnection(), $admin_dn, $admin_pw);
        $this->_unsetErrorHandler();            
                
        if ($admin_bind_result) {
            //echo "Admin bind successful\n";

            // Perform search for user data
            $this->_setErrorHandler();
            
            $attrs   = ['cn', 'uid', 'memberOf','dn'];  // explicitly ask for memberof (26May 2025 - For RBA)
            
            $search_result = ldap_search($this->getConnection(), $base_dn, $search_filter,$attrs);
            $this->_unsetErrorHandler();

            // Check if search was successful
            if ($search_result) {
                //echo "Search successful\n";

                // Retrieve user data from search result
                $this->_setErrorHandler();
                $user_data = ldap_get_entries($this->getConnection(), $search_result);
                $this->_unsetErrorHandler();


                if(!isset($user_data[0])){ //No match
                    return null;
                }
                
                $rba_check = $this->_checkLdapRba($user_data ,$cfg);
                if($rba_check == 'no_match'){
                    return null;
                }
                // Formulate DN for user bind
                $user_dn = $user_data[0]['dn'];

                // Bind as user
                $this->_setErrorHandler();
                $user_bind_result = ldap_bind($this->getConnection(), $user_dn, $password);
                $this->_unsetErrorHandler();

                // Check if user bind was successful
                if ($user_bind_result) {
                //    echo "User bind successful\n";
                    $db_user = $this->_findOrmUser($username,$cfg,$rba_check);
                    if($db_user){
                        return $db_user;
                    }else{
                        return $this->_addOrmUser($username,$cfg,$rba_check);
                    }
                } else {
                  //  echo "User bind failed: " . ldap_error($this->getConnection()) . "\n";
                }
            } else {
              //  echo "Search failed: " . ldap_error($ldap_conn) . "\n";
            }
        } else {
          //  echo "Admin bind failed: " . ldap_error($this->getConnection()) . "\n";
        }
        return null;
    }
    
    private function _checkLdapRba(array $user_data, array $cfg){
    
        if(isset($cfg['rba_enabled']) && (bool)$cfg['rba_enabled']){
        
            //Get all the groups the user belongs to
            $group_attribute = $cfg['rba_group_attribute'];
            $groups = [];
            if ($user_data['count'] > 0) {
                $user = $user_data[0];
                if (isset($user[$group_attribute])) {
                    for ($i = 0; $i < $user['memberof']['count']; $i++) {
                        $groups[] = $user['memberof'][$i];
                    }
                }
            }
        
            //Admin role
            if(isset($cfg['rba_admin_enabled']) && (bool)$cfg['rba_admin_enabled']){
                $admin_group = $cfg['rba_admin_group'];
                foreach($groups as $group){
                    if (strcasecmp($group, $admin_group) == 0) {
                        return 'admin';
                    }
                }          
            } 
            
            //Operator role
            if(isset($cfg['rba_operator_enabled']) && (bool)$cfg['rba_operator_enabled']){
                $operator_group = $cfg['rba_operator_group'];
                foreach($groups as $group){
                    if (strcasecmp($group, $operator_group) == 0) {
                        return 'operator';
                    }
                }          
            }
            
            //View role
            if(isset($cfg['rba_view_enabled']) && (bool)$cfg['rba_view_enabled']){
                $view_group = $cfg['rba_view_group'];
                foreach($groups as $group){
                    if (strcasecmp($group, $view_group) == 0) {
                        return 'view';
                    }
                }          
            }      
        
            return 'no_match';      
        }
        
        return false;
    }
    
    private function _findOrmUser($username,$cfg,$rba_check)
    {
        // Retrieve the Users table instance
        $usersTable = $this->getTableLocator()->get('Users');
        
        $username = $this->username_prefix.$username;

        // Example: Query the Users table
        $user = $usersTable->find()
            ->where(['username' => $username])
            ->first();
        if($user){
            $this->_adjustRba($user,$cfg,$rba_check);
        }      
        return $user;    
    }
    
    private function _addOrmUser($username,$cfg,$rba_check)
    {
        // Retrieve the Users table instance
        $usersTable = $this->getTableLocator()->get('Users');      
        $username   = $this->username_prefix.$username;            
        $userData   = [
            'username'      => $username,
            'password'      => bin2hex(random_bytes(8)), // Generates a 16-character hex string,
            'name'          => '',
            'surname'       => '',
            'address'       => '',
            'phone'         => '',
            'email'         => '',
            'language_id'   => 4,
            'country_id'    => 4,
            'token'         => '',
            'group_id'      => 9,
            'active'        => 1
        ];
        
        $user       = $usersTable->newEntity($userData);

        // Step 3: Save the entity
        if ($usersTable->save($user)) {
            // Success: Return the saved user entity
            $this->_adjustRba($user,$cfg,$rba_check);
            return $user;
        } else {
            // Failure: Handle validation errors or other issues
            throw new \RuntimeException('Unable to save user.');
        }
    }
    
    private function _adjustRba($user,$cfg,$rba_check){
        if(!$rba_check){
            return;
        }
        
        $components = ['permanent_users', 'vouchers', 'dynamic_clients', 'nas', 'profiles', 'realms', 'meshes', 'ap_profiles', 'other'];
        
        $cloudAdminsTbl = $this->getTableLocator()->get('CloudAdmins');
        $cloud_id       = $cfg['rba_cloud'];
        $user_id        = $user->id;
        $permissions    = $rba_check;
        
        if($rba_check == 'operator'){
            $permissions = 'granular'; //legacy wording
        }
             
        $caData = [
            'cloud_id'      => $cloud_id,
            'user_id'       => $user_id,
            'permissions'   => $permissions
        ];
        
        foreach($components as $component){
            $key = 'rba_'.$rba_check.'_cmp_'.$component;
            if(isset($cfg[$key])){
                $caData['cmp_'.$component] = $cfg[$key];
            }       
        }
              
        $cloudAdmin     = $cloudAdminsTbl->find()->where(['CloudAdmins.cloud_id' => $cloud_id,'CloudAdmins.user_id' => $user_id])->first();
        if($cloudAdmin){
        
            $cloudAdminsTbl->patchEntity($cloudAdmin,$caData);
            $cloudAdminsTbl->save($cloudAdmin);
        
            //if($cloudAdmin->permissions !== $permissions){
                //Adjust the permissions
            //}
        }else{
            
            $cloudAdmin  = $cloudAdminsTbl->newEntity($caData);
            $cloudAdminsTbl->save($cloudAdmin);
            
        }
        $this->_updateSettings($user_id,$cfg); 
    }
    
    private function _updateSettings($user_id,$cfg){
    
        $settingsData = [
            'cloud_id'          => $cfg['rba_cloud'],
            'realm_id'          => $cfg['rba_realm'], 
            'compact_view'      => 1,
            'radius_overview'   => 1
        ];
        $userSettingsTbl = $this->getTableLocator()->get('UserSettings');
    
        foreach(array_keys($settingsData) as $setting){
            $value          = $settingsData[$setting];
            $userSetting    = $userSettingsTbl->find()->where(['UserSettings.user_id' => $user_id, 'UserSettings.name' => $setting ])->first();
            if($userSetting){
                $userSettingsTbl->patchEntity($userSetting, ['value'=> $value]);
                $userSettingsTbl->save($userSetting);
            }else{
                $d = [];
                $d['name']      = $setting;
                $d['value']     = $value;
                $d['user_id']   = $user_id;
                $entity = $userSettingsTbl->newEntity($d);
                $userSettingsTbl->save($entity);
            }
        }      
    }
    
}
