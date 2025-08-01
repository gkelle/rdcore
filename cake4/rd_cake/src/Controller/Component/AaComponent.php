<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: A component used to determine Authentication and Authorization of a request
//---- Date: 18-MAR-2025
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\ORM\TableRegistry;


class AaComponent extends Component {

    protected $comps = [
        'cmp_permanent_users' => true,
        'cmp_vouchers' => true,
        'cmp_dynamic_clients' => true,
        'cmp_nas' => true,
        'cmp_profiles' => true,
        'cmp_realms' => true,
        'cmp_meshes' => true,
        'cmp_ap_profiles' => true,
        'cmp_other' => true,
    ];

    //Jan 2025 -- view, custom (operator) or admin permissions plus components for cloud
    public function rights_and_components_on_cloud(){
        //We retrun an array with key 'rights' and key 'components'
        return $this->_rights_and_components_on_cloud();  
    }

    //-- Jun 2024 -- view or admin permissions for cloud
    public function rights_on_cloud(){
        //Rights on a cloud can be admin or view or false
        return $this->_rights_on_cloud();    
    }

	public function user_for_token_with_cloud(){
        return $this->_check_if_valid(true);
    }
  
    public function user_for_token(){
        return $this->_check_if_valid(false);
    }

    public function fail_no_rights($message=false){
        $this->_fail_no_rights($message);
    }

    public function admin_check($controller,$hard_fail=true){

        //Check if the supplied token belongs to a user that is part of the Configure::read('group.admin') group
        //-- Authenticate check --
        $token_check = $this->_check_if_valid(false);
        if(!$token_check){
            return false;
        }else{

            if($token_check['group_name'] == Configure::read('group.admin')){ 
                return true;
            }else{
                if($hard_fail){
                    $this->_fail_no_rights();
                }
                return false;
            }
        }
    }

    public function ap_check($controller,$hard_fail=true){
        //-- Authenticate check --
        $token_check = $this->_check_if_valid($controller);
        if(!$token_check){
            return false;
        }else{

            if($token_check['group_name'] == Configure::read('group.ap')){ 
                return true;
            }else{
                if($hard_fail){
                    $this->_fail_no_rights();
                }
                return false;
            }
        }
    }
    
    public function realmCheck($returnNames = false){
    
        $controller = $this->getController();
        $request    = $controller->getRequest();   
        $token      = $request->getData('token') ?? $request->getQuery('token');
        $result     = $this->_find_token_owner($token);
        $user_id    = $result['user']['id'];
        $cloud_id   = $request->getData('cloud_id') ?? $request->getQuery('cloud_id');
        $realmsTable= TableRegistry::get('Realms');
        $realmAdmins= TableRegistry::get('RealmAdmins');
        $realm_list = [];
        
        $realms     = $realmsTable->find()->where(['Realms.cloud_id' => $cloud_id])->all();
        foreach($realms as $realm){
            $realmAdmin = $realmAdmins->find()->where(['RealmAdmins.realm_id' => $realm->id, 'RealmAdmins.user_id' => $user_id])->count();
            if($realmAdmin > 0){
                if($returnNames){
                    $realm_list[] = $realm->name;
                }else{
                    $realm_list[] = $realm->id;
                }
            }
        }
        
        if(count($realm_list) > 0){
            return $realm_list;
        }        
        return false;   
    }
    
    public function checkRbaAccess($user){
    
        $action     = $this->getController()->getRequest()->getParam('action');
        $userRole   = $user['role'];
        
        $crtl_name  = $this->getController()->getRequest()->getParam('controller');
        $crtl_name  = 'Rba'.$crtl_name;
        
        $fileName   = $crtl_name.'.php'; // Replace with your config file name
        $filePath   = CONFIG . $fileName;

        if (!file_exists($filePath)) {
            return $user;
        } 
        
        Configure::load($crtl_name);
        $acl  = Configure::read($crtl_name);

        // Get allowed actions for the role
        $allowedActions = $acl[$userRole];
        
        //Should we log the actions on this controller
        if(isset($acl['logActions'])&&($acl['logActions'])){
            //--Log Action--
        }
        
        // Allow all actions if the role has '*'
        if (in_array('*', $allowedActions)) {
            $user['rba_allowed'] = $allowedActions;
            return $user;
        }
        
        // Check if the action is allowed
        if(in_array($action, $allowedActions)){
            $user['rba_allowed'] = $allowedActions;
            return $user;
        }      
    }
    
    public function denyRbaAccess(){
    
        $controller = $this->getController();
        $controller->set([
            'success' => false,
            'message' => __('Access denied'),
        ]);
        $controller->viewBuilder()->setOption('serialize', true);
    }
    
    //-------------
    
     private function _rights_and_components_on_cloud(){
    
        $controller = $this->getController();
        $request = $controller->getRequest();
        $token = $request->getData('token') ?? $request->getQuery('token');
        if (!$token || strlen($token) != 36) {
            return ['rights' => false];
        }
        $result = $this->_find_token_owner($token);
        if (!$result['success']) {
            return ['rights' => false];
        }
        $user = $result['user'];
        $cloud_id = $request->getData('cloud_id') ?? $request->getQuery('cloud_id');
        if (!$cloud_id) {
            return false;
        }
        switch ($user['group_name']) {
            case Configure::read('group.admin'):
                return ['rights' => 'admin', 'components' => $this->comps];
            case Configure::read('group.ap'):
                $clouds = TableRegistry::get('Clouds');
                $is_owner = $clouds->find()->where(['Clouds.id' => $cloud_id, 'Clouds.user_id' => $user['id']])->first();
                if ($is_owner) {
                    return ['rights' => 'admin', 'components' => $this->comps];
                }
                $cloud_admins = TableRegistry::get('CloudAdmins');
                $c_a = $cloud_admins->find()->where(['CloudAdmins.user_id' => $user['id'], 'CloudAdmins.cloud_id' => $cloud_id])->first();
                if ($c_a) {
                    // Convert the entity to an array
                    $entityArray = $c_a->toArray();
                    // Initialize an array to store the filtered items
                    $comps = [];
                    // Loop through the entity's keys/attributes
                    foreach ($entityArray as $key => $value) {
                        // Check if the key starts with 'cmp_'
                        if (strpos($key, 'cmp_') === 0) {
                            // Add the key-value pair to the filtered array
                            $comps[$key] = $value;
                        }
                    }                
                    return ['rights' => $c_a->permissions,'components' => $comps];
                }
                return ['rights' => false];
            default:
                return ['rights' => false];
        }       
    }   
           
    private function _rights_on_cloud(){
    
        $controller = $this->getController();
        $request = $controller->getRequest();
        $token = $request->getData('token') ?? $request->getQuery('token');
        if (!$token || strlen($token) != 36) {
            return false;
        }
        $result = $this->_find_token_owner($token);
        if (!$result['success']) {
            return false;
        }
        $user = $result['user'];
        $cloud_id = $request->getData('cloud_id') ?? $request->getQuery('cloud_id');
        if (!$cloud_id) {
            return false;
        }
        switch ($user['group_name']) {
            case Configure::read('group.admin'):
                return 'admin';
            case Configure::read('group.ap'):
                $clouds = TableRegistry::get('Clouds');
                $is_owner = $clouds->find()->where(['Clouds.id' => $cloud_id, 'Clouds.user_id' => $user['id']])->first();
                if ($is_owner) {
                    return 'admin';
                }
                $cloud_admins = TableRegistry::get('CloudAdmins');
                $c_a = $cloud_admins->find()->where(['CloudAdmins.user_id' => $user['id'], 'CloudAdmins.cloud_id' => $cloud_id])->first();
                if ($c_a) {
                    return $c_a->permissions;
                }
                return false;
            default:
                return false;
        }        
    } 
    
    private function _check_if_valid($with_cloud = true){

        $controller = $this->getController();
        $request    = $controller->getRequest();
        $action     = $request->getParam('action');
        $r_data     = $request->getData();
        $q_data     = $request->getQuery();


        $token      = $r_data['token'] ?? $q_data['token'] ?? false;
        $cloud_id   = $r_data['cloud_id'] ?? $q_data['cloud_id'] ?? $q_data['settings_cloud_id'] ?? false;

        // Check if the token is present and valid
        if (!$token) {
            return $this->_fail_response(__('Token missing'));
        }

        if (strlen($token) !== 36) {
            return $this->_fail_response(__('Token in wrong format'));
        }

        // Find the owner of the token
        $result = $this->_find_token_owner($token);
        if (!$result['success']) {
            return $this->_fail_response($result['message']);
        }

        // Check if cloud_id is required and valid
        if ($with_cloud && !$cloud_id) {
            return $this->_fail_response(__('Cloud ID Missing'));
        }

        // Validate user group and permissions
        $user       = $result['user'];
        $groupName  = $user['group_name'];
        $isAdmin    = ($groupName === Configure::read('group.admin'));
        $isApUser   = ($groupName === Configure::read('group.ap'));

        if ($isAdmin) {
            $user['role'] = 'admin';
            return $user;
        }

        if ($isApUser) {
            if ($with_cloud){
                $role = $this->_can_manage_cloud($user['id'], $cloud_id);
                $user['role'] = $role;          
            }
            return $user;
        }

        return $this->fail_no_rights();
    }
          
    private function _can_manage_cloud($user_id,$cloud_id){
    
    	$clouds	    = TableRegistry::get('Clouds');   	
    	$is_owner	= $clouds->find()->where(['Clouds.id' => $cloud_id, 'Clouds.user_id' => $user_id])->first();
    	
    	if($is_owner){
    		return 'admin';
    	}
    	  
    	$cloud_admins  	= TableRegistry::get('CloudAdmins');
    	$cloudAdmin     = $cloud_admins->find()->where(['CloudAdmins.user_id' => $user_id,'CloudAdmins.cloud_id' => $cloud_id])->first();
    	if($cloudAdmin){
    		return $cloudAdmin->permissions;
    	}
    	return false;
    }
    
    private function _find_token_owner($token){
    
        $users  = TableRegistry::get('Users');
        $user   = $users->find()->contain(['Groups'])->where(['Users.token' => $token])->first();

        if(!$user){
            return ['success' => false, 'message' =>  __('No user for token')];
        }else{

            //Check if account is active or not:
            if($user->active==0){
                return ['success' => false, 'message' =>  __('Account disabled')];
            }else{
                $user = [
                    'id'            => $user->id,
                    'group_name'    => $user->group->name,
                    'group_id'      => $user->group->id
                ];  
                return ['success' => true, 'user' => $user];
            }
        }
    }
    
    private function _fail_no_rights($message = ''){
        if(empty($message)){
            $message = __('You do not have rights for this action');
        }
        $controller = $this->getController();       
    	$controller->set([
        	'success'       => false,
        	'message'       => $message
        ]);
		$controller->viewBuilder()->setOption('serialize', true);
    }
    
    // Helper method to handle failure responses
    private function _fail_response($message){

        $controller = $this->getController();
        $controller->set([
            'success' => false,
            'message' => $message,
        ]);
        $controller->viewBuilder()->setOption('serialize', true);
        return false;
    }
    
}
