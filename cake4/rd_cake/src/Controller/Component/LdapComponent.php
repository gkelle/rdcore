<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: 
//---- Date: 09-Feb-2025
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;
use Cake\ORM\TableRegistry;


class LdapComponent extends Component {

      
    public function initialize(array $config):void{
    
        $this->UserSettings  = TableRegistry::get('UserSettings');
   
    }

    public function testLdap(){
    
        $username   = $this->getController()->getRequest()->getData('username');
        $password   = $this->getController()->getRequest()->getData('password');
        $items      = [];
            
        $ldapSettings   = [];
        $userSettings   = $this->UserSettings->find()->where(['UserSettings.user_id' => -1, 'UserSettings.name LIKE' => 'ldap_%' ])->all();
        foreach($userSettings as $userSetting){
            $ldapSettings[$userSetting->name] = $userSetting->value;
        }
        
        if($ldapSettings['ldap_enabled'] && $ldapSettings['ldap_enabled'] === '1'){
            $proto = 'ldap';
            if($ldapSettings['ldap_use_ldaps'] && $ldapSettings['ldap_use_ldaps'] === '1'){
                $proto = 'ldaps';
            }
            $conn_string = $proto.'://'.$ldapSettings['ldap_host'].':'.$ldapSettings['ldap_port'];
            $ldap_conn = ldap_connect($conn_string);
            
            // Set LDAP options (recommended for proper functionality)
            ldap_set_option($ldap_conn, LDAP_OPT_PROTOCOL_VERSION, 3);
            ldap_set_option($ldap_conn, LDAP_OPT_REFERRALS, 0);
            
            try {
            
                //---- TEST ONE Admin Binding ---
                $test_number = 1;
                $test_name   = 'Admin Binding';
                $this->_setErrorHandler();
                $admin_bind_result = ldap_bind($ldap_conn, $ldapSettings['ldap_bind_dn'], $ldapSettings['ldap_bind_password']);
                
                
                // Restore the original error handler
                restore_error_handler();
              //  if (!$admin_bind_result) {
               //     throw new \Exception('Could not connect to LDAP server.');
              //  }                    
                $items[] = [ 'number' => $test_number, 'name' => $test_name, 'pass' => true, 'message' => 'Connected to LDAP server' ];
                
                // Perform search for user data
                $search_filter = sprintf($ldapSettings['ldap_filter'], ldap_escape($username, '', LDAP_ESCAPE_FILTER));
                
                //---- TEST TWO Search for user ----
                $test_number = 2;
                $test_name   = 'Find Username';
                $this->_setErrorHandler();
                
                $attrs   = ['cn', 'uid', 'memberOf','dn'];  // explicitly ask for memberof (26May 2025 - For RBA)
                
                $search_result = ldap_search($ldap_conn, $ldapSettings['ldap_base_dn'], $search_filter,$attrs);
                // Restore the original error handler
                restore_error_handler();
                if (!$search_result) {
                    throw new \Exception("Could not find user $searcfilter");
                }
                $user_data = ldap_get_entries($ldap_conn, $search_result); 
                
                if($user_data && isset($user_data[0])){           
                    $user_data = $this->_rCountRemover($user_data);
                    $user_data = $this->_removeNumericKeys($user_data[0]);                 
                    $user_data_txt = $this->_convertToPlainText($user_data); 
                    $items[]   = [ 'number' => $test_number, 'name' => $test_name, 'pass' => true, 'message' => $user_data_txt ];
                }else{
                    throw new \Exception("Could not find user $username");
                }              
                
                if(isset($user_data['dn'])){
                    //---- TEST THREE Authtenticate ----
                    $test_number = 3;
                    $test_name   = 'Authenticate User';                
                     $this->_setErrorHandler();
                     $user_bind_result = ldap_bind($ldap_conn, $user_data['dn'], $password);
                     restore_error_handler();
                     if (!$user_bind_result) {
                        throw new \Exception("Could not authenticate $username with $password");
                    }
                    $items[] = [ 'number' => $test_number, 'name' => $test_name, 'pass' => true, 'message' => 'Authenticated Fine' ];                
                }                                  
                
            } catch (\Exception $e) {
                $items[] = [ 'number' => $test_number, 'name' => $test_name, 'pass' => false, 'message' => $e->getMessage()];
               
            }    
        }       
        return $items;
    }


    // Function to remove elements with numeric keys
    private function _removeNumericKeys($array) {
        $result = [];
        foreach ($array as $key => $value) {
            // Check if the key is not numeric
            if (!is_numeric($key)) {
                $result[$key] = $value;
            }
        }
        return $result;
    }

  	private function _rCountRemover($arr) {
      foreach($arr as $key=>$val) {
        # (int)0 == "count", so we need to use ===
        if($key === "count") 
          unset($arr[$key]);
        elseif(is_array($val))
          $arr[$key] = $this->_rCountRemover($arr[$key]);
      }
      return $arr;
    }
    
    private function _convertToPlainText($data) {
        $result = [];

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $result[] = "$key: " . implode(", ", $value);
            } else {
                $result[] = "$key: $value";
            }
        }
        return $result;
    }

    
    /**
    * Convert PHP warnings into exceptions for LDAP functions.
    */
    protected function _setErrorHandler(): void
    {
        set_error_handler(
            function ($errorNumber, $errorText) {
                throw new \ErrorException($errorText, $errorNumber);
            },
            E_ALL
        );
    }
}
