<?php
declare(strict_types=1);

/**
 * CakePHP(tm) : Rapid Development Framework (https://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 * @link          https://cakephp.org CakePHP(tm) Project
 * @since         1.0.0
 * @license       https://opensource.org/licenses/mit-license.php MIT License
 */

namespace App\Authentication\Identifier;


use ArrayAccess;
use ArrayObject;
use Authentication\Identifier\Ldap\AdapterInterface;
use Authentication\Identifier\Ldap\ExtensionAdapter;
use Cake\Core\App;
use ErrorException;
use InvalidArgumentException;
use RuntimeException;

use Cake\ORM\TableRegistry;

use Authentication\Authenticator\Result;

use Authentication\Identifier\LdapIdentifier as BaseLdapIdentifier;

use Cake\Log\Log;

class CustomLdapIdentifier extends BaseLdapIdentifier
{

    protected bool $ldapEnabled = false;
    /**
     * Default configuration
     *
     * @var array
     */
    protected $_defaultConfig = [
        'ldap' => ExtensionAdapter::class,
        'fields' => [
            self::CREDENTIAL_USERNAME => 'username',
            self::CREDENTIAL_PASSWORD => 'password',
        ],
        'port' => 389,
        'options' => [
            'tls' => false,
        ],
    ];

    /**
     * List of errors
     *
     * @var array
     */
    protected $_errors = [];

    /**
     * LDAP connection object
     *
     * @var \Authentication\Identifier\Ldap\AdapterInterface
     */
    protected $_ldap;
    
    public function __construct(array $config = [])
    {
        $settingsTable = TableRegistry::getTableLocator()->get('UserSettings');

        // Fetch all LDAP settings
        $ldapSettings = $settingsTable->find()
            ->where(['UserSettings.user_id' => -1, 'UserSettings.name LIKE' => 'ldap_%' ])
            ->all()
            ->combine('name', 'value') // Convert to key-value array
            ->toArray();
            
  //      print_r($ldapSettings);
            
         /*  $ldapSettings = [
            'ldap_enabled'          => 1,
            'ldap_host'             => '127.0.0.1' 
            'ldap_bind_dn'          => 'cn=admin,dc=example,dc=com',
            'ldap_bind_password'    => 'testing123',
            'ldap_base_dn'          => 'dc=example,dc=com',
            'ldap_port'             => 389,
            'ldap_use_ldaps'        => 0,           
            'ldap_filter'           => (&(objectClass=posixAccount)(uid=%s))  or (uid=%s),
            
            'ldap_rba_enabled'          => 1,
            'ldap_rba_group_attribute'  => memberof,
            'ldap_rba_cloud'            => 54,
            'ldap_rba_admin_enabled'    => 1,
            'ldap_rba_operator_enabled' => 0,
            'ldap_rba_view_enabled'     => 0,
            'ldap_rba_admin_group'      => cn=developers,ou=Groups,dc=localdomain,dc=com,
            'ldap_rba_admin_cmp_permanent_users'    => 1,
            'ldap_rba_admin_cmp_dynamic_clients'    => 1,
            'ldap_rba_admin_cmp_nas'                => 1,
            'ldap_rba_admin_cmp_profiles'           => 1,
            'ldap_rba_admin_cmp_realms'             => 1,
            'ldap_rba_admin_cmp_other'              => 1,
            'ldap_rba_admin_cmp_meshes'             => 1,
            'ldap_rba_admin_cmp_ap_profiles'        => 1,
            'ldap_rba_admin_cmp_vouchers'           => 1,
            'ldap_rba_operator_cmp_permanent_users' => 0,
            'ldap_rba_operator_cmp_vouchers'        => 0,
            'ldap_rba_operator_cmp_dynamic_clients' => 0,
            'ldap_rba_operator_cmp_nas'             => 0,
            'ldap_rba_operator_cmp_profiles'        => 0,
            'ldap_rba_operator_cmp_realms'          => 0,
            'ldap_rba_operator_cmp_meshes'          => 0,
            'ldap_rba_operator_cmp_ap_profiles'     => 0,
            'ldap_rba_operator_cmp_other'           => 0,
            'ldap_rba_view_cmp_permanent_users'     => 0,
            'ldap_rba_view_cmp_vouchers'            => 0,
            'ldap_rba_view_cmp_dynamic_clients'     => 0,
            'ldap_rba_view_cmp_nas'                 => 0,
            'ldap_rba_view_cmp_profiles'            => 0,
            'ldap_rba_view_cmp_realms'              => 0,
            'ldap_rba_view_cmp_meshes'              => 0,
            'ldap_rba_view_cmp_ap_profiles'         => 0,
            'ldap_rba_view_cmp_other'               => 0,
            'ldap_rba_realm'                        => 0
            
        ]; 	*/
        
        if (!empty($ldapSettings)) {
            // Convert ldap_enabled to a boolean
            $this->ldapEnabled = isset($ldapSettings['ldap_enabled']) && (bool)$ldapSettings['ldap_enabled'];
            $tls    = false;
            $tls    = isset($ldapSettings['ldap_use_ldaps']) && (bool)$ldapSettings['ldap_use_ldaps'];
            
            // Build LDAP config from settings
            $configFromDb = [
                'host'      => $ldapSettings['ldap_host'] ?? null,
                'port'      => (int)$ldapSettings['ldap_port'] ?? null,
                'tls'       => $tls,
                'admin_dn'  => $ldapSettings['ldap_bind_dn'] ?? null,
                'admin_pw'  => $ldapSettings['ldap_bind_password'] ?? null,
                'base_dn'   => $ldapSettings['ldap_base_dn'] ?? null,
                'filter'    => $ldapSettings['ldap_filter'] ?? null,
                'enabled'   => $this->ldapEnabled,
                
                //Role Based Access
                'rba_enabled'           => $ldapSettings['ldap_rba_enabled'] ?? null,
                'rba_group_attribute'   => $ldapSettings['ldap_rba_group_attribute'] ?? null,
                'rba_cloud'             => $ldapSettings['ldap_rba_cloud'] ?? null,
                'rba_realm'             => $ldapSettings['ldap_rba_realm'] ?? null,
                
                //Admin
                'rba_admin_enabled'     => $ldapSettings['ldap_rba_admin_enabled'] ?? null,
                'rba_admin_group'       => $ldapSettings['ldap_rba_admin_group'] ?? null,
                
                'rba_admin_cmp_permanent_users' => $ldapSettings['ldap_rba_admin_cmp_permanent_users'] ?? null,
                'rba_admin_cmp_vouchers'        => $ldapSettings['ldap_rba_admin_cmp_vouchers'] ?? null,
                'rba_admin_cmp_dynamic_clients' => $ldapSettings['ldap_rba_admin_cmp_dynamic_clients'] ?? null,
                'rba_admin_cmp_nas'             => $ldapSettings['ldap_rba_admin_cmp_nas'] ?? null,
                'rba_admin_cmp_profiles'        => $ldapSettings['ldap_rba_admin_cmp_profiles'] ?? null,
                'rba_admin_cmp_realms'          => $ldapSettings['ldap_rba_admin_cmp_realms'] ?? null,
                'rba_admin_cmp_meshes'          => $ldapSettings['ldap_rba_admin_cmp_meshes'] ?? null,
                'rba_admin_cmp_ap_profiles'     => $ldapSettings['ldap_rba_admin_cmp_ap_profiles'] ?? null,
                'rba_admin_cmp_other'           => $ldapSettings['ldap_rba_admin_cmp_other'] ?? null,
                
                //Operator
                'rba_operator_enabled'     => $ldapSettings['ldap_rba_operator_enabled'] ?? null,
                'rba_operator_group'       => $ldapSettings['ldap_rba_operator_group'] ?? null,
                
                'rba_operator_cmp_permanent_users' => $ldapSettings['ldap_rba_operator_cmp_permanent_users'] ?? null,
                'rba_operator_cmp_vouchers'        => $ldapSettings['ldap_rba_operator_cmp_vouchers'] ?? null,
                'rba_operator_cmp_dynamic_clients' => $ldapSettings['ldap_rba_operator_cmp_dynamic_clients'] ?? null,
                'rba_operator_cmp_nas'             => $ldapSettings['ldap_rba_operator_cmp_nas'] ?? null,
                'rba_operator_cmp_profiles'        => $ldapSettings['ldap_rba_operator_cmp_profiles'] ?? null,
                'rba_operator_cmp_realms'          => $ldapSettings['ldap_rba_operator_cmp_realms'] ?? null,
                'rba_operator_cmp_meshes'          => $ldapSettings['ldap_rba_operator_cmp_meshes'] ?? null,
                'rba_operator_cmp_ap_profiles'     => $ldapSettings['ldap_rba_operator_cmp_ap_profiles'] ?? null,
                'rba_operator_cmp_other'           => $ldapSettings['ldap_rba_operator_cmp_other'] ?? null,
                
                //View
                'rba_view_enabled'     => $ldapSettings['ldap_rba_view_enabled'] ?? null,
                'rba_view_group'       => $ldapSettings['ldap_rba_view_group'] ?? null,
                
                'rba_view_cmp_permanent_users' => $ldapSettings['ldap_rba_view_cmp_permanent_users'] ?? null,
                'rba_view_cmp_vouchers'        => $ldapSettings['ldap_rba_view_cmp_vouchers'] ?? null,
                'rba_view_cmp_dynamic_clients' => $ldapSettings['ldap_rba_view_cmp_dynamic_clients'] ?? null,
                'rba_view_cmp_nas'             => $ldapSettings['ldap_rba_view_cmp_nas'] ?? null,
                'rba_view_cmp_profiles'        => $ldapSettings['ldap_rba_view_cmp_profiles'] ?? null,
                'rba_view_cmp_realms'          => $ldapSettings['ldap_rba_view_cmp_realms'] ?? null,
                'rba_view_cmp_meshes'          => $ldapSettings['ldap_rba_view_cmp_meshes'] ?? null,
                'rba_view_cmp_ap_profiles'     => $ldapSettings['ldap_rba_view_cmp_ap_profiles'] ?? null,
                'rba_view_cmp_other'           => $ldapSettings['ldap_rba_view_cmp_other'] ?? null,           

            ];

            // Merge DB config with provided config
            $config = array_merge($config, $configFromDb);
        }

        parent::__construct($config);
        
        $this->_checkLdapConfig();
        $this->_buildLdapObject();
    }
    

    /**
     * @inheritDoc
     */
    public function __constructZZ(array $config = [])
    {
        parent::__construct($config);

        $this->_checkLdapConfig();
        $this->_buildLdapObject();
    }

    /**
     * Checks the LDAP config
     *
     * @throws \RuntimeException
     * @throws \InvalidArgumentException
     * @return void
     */
    protected function _checkLdapConfig(): void
    {
        if (!isset($this->_config['bindDN'])) {
            throw new RuntimeException('Config `bindDN` is not set.');
        }
        if (!is_callable($this->_config['bindDN'])) {
            throw new InvalidArgumentException(sprintf(
                'The `bindDN` config is not a callable. Got `%s` instead.',
                gettype($this->_config['bindDN'])
            ));
        }
        if (!isset($this->_config['host'])) {
            throw new RuntimeException('Config `host` is not set.');
        }
    }

    /**
     * Constructs the LDAP object and sets it to the property
     *
     * @throws \RuntimeException
     * @return void
     */
    protected function _buildLdapObject(): void
    {
        $ldap = $this->_config['ldap'];

        if (is_string($ldap)) {
            $class = App::className($ldap, 'Identifier/Ldap');
            if (!$class) {
                throw new RuntimeException(sprintf(
                    'Could not find LDAP identfier named `%s`',
                    $ldap
                ));
            }
            $ldap = new $class();
        }

        if (!($ldap instanceof AdapterInterface)) {
            $message = sprintf('Option `ldap` must implement `%s`.', AdapterInterface::class);
            throw new RuntimeException($message);
        }

        $this->_ldap = $ldap;
    }

    /**
     * @inheritDoc
     */
    public function identify(array $credentials)
    {
    
        // If LDAP is disabled, return null to prevent authentication
        if (!$this->ldapEnabled) {
            return null;
        }
        
       // Log::error("Short Circuit - Goodbye!!");
       // return null;
    
        $this->_connectLdap();
        $fields         = $this->getConfig('fields');
        $isUsernameSet  = isset($credentials[$fields[self::CREDENTIAL_USERNAME]]);
        $isPasswordSet  = isset($credentials[$fields[self::CREDENTIAL_PASSWORD]]);
        if ($isUsernameSet && $isPasswordSet) {       
            return $this->_bindUser(
                $credentials[$fields[self::CREDENTIAL_USERNAME]],
                $credentials[$fields[self::CREDENTIAL_PASSWORD]]
            );
        }
        return null;
    }

    /**
     * Returns configured LDAP adapter.
     *
     * @return \Authentication\Identifier\Ldap\AdapterInterface
     */
    public function getAdapter(): AdapterInterface
    {
        return $this->_ldap;
    }

    /**
     * Initializes the LDAP connection
     *
     * @return void
     */
    protected function _connectLdap(): void
    {
        $config = $this->getConfig();

        $this->_ldap->connect_new(
            $config['host'],
            $config['port'],
            (array)$this->getConfig('options'),
            $config['tls']
        );
    }

    /**
     * Try to bind the given user to the LDAP server
     *
     * @param string $username The username
     * @param string $password The password
     * @return \ArrayAccess|null
     */    
    protected function _bindUser(string $username, string $password): ?ArrayAccess
    {
    
        $config = $this->getConfig();
        try {
            $ldapBind = $this->_ldap->advBind($username, $password,$config);
            if ($ldapBind) {
                $this->_ldap->unbind();                         
                return $ldapBind;           
            }
        } catch (ErrorException $e) {
            $this->_handleLdapError($e->getMessage());
        }
        $this->_ldap->unbind();

        return null;
    }
     

    /**
     * Handles an LDAP error
     *
     * @param string $message Exception message
     * @return void
     */
    protected function _handleLdapError(string $message): void
    {
        $extendedError = $this->_ldap->getDiagnosticMessage();
        if (!is_null($extendedError)) {
            $this->_errors[] = $extendedError;
        }
        $this->_errors[] = $message;
    }
}
