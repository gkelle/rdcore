Ext.define('Rd.view.settings.cntSettingsLdapRba', {
    extend      : 'Ext.container.Container',
    alias       : 'widget.cntSettingsLdapRba',
    role        : 'admin', //default = admin, options: admin, operator, view
    layout      : 'anchor',
    disabled    : true,
    defaults    : {
        anchor  : '100%'
    },
    defaultType : 'textfield',
    initComponent: function(){
        const me    = this;
        var   role  = me.role;
        me.items    = [
            { 
                fieldLabel      : 'Enable', 
                name            : 'ldap_rba_'+role+'_enabled', 
                itemId          : 'chkSettingsLdapRba',
                labelClsExtra   : 'lblRdReq',
                checked         : false, 
                xtype           : 'checkbox'
            },
            {
                xtype       : 'textfield',
                fieldLabel  : 'LDAP Group',
                name        : 'ldap_rba_'+role+'_group',
                allowBlank  : false,
                disabled    : true
            },           
            {
                xtype       : 'checkboxgroup',
                userCls     : 'divGroup',
                columns     : 2,
                vertical    : true,
                disabled    : true,
                items   : [
                    {    
				        fieldLabel  : '<i class=\"fa fa-user\"></i> Permanent Users',
				        name        : 'ldap_rba_'+role+'_cmp_permanent_users'
				        
			        },
			        {
				        fieldLabel  : '<span style="font-family:FontAwesome;font-size:18px;">&#xf145</span> Vouchers',
				        name        : 'ldap_rba_'+role+'_cmp_vouchers'
			        }
                ]
            },
		    {
                xtype       : 'checkboxgroup',
                cls         : 'divGroup',
                columns     : 2,
                vertical    : false,
                disabled    : true,
                items       : [
                    { 
                        fieldLabel  : '<i class=\"fa fa-circle-o-notch\"></i> RADIUS Clients',
                        name        : 'ldap_rba_'+role+'_cmp_dynamic_clients'
                    },
                    { 
                        fieldLabel  : '<i class=\"fa fa-cube\"></i> NAS',
                        name        : 'ldap_rba_'+role+'_cmp_nas'
                    },
                    { 
                        fieldLabel  : '<i class=\"fa fa-cubes\"></i> Profiles',
                        name        : 'ldap_rba_'+role+'_cmp_profiles'
                    },
                    { 
                        fieldLabel  : '<i class=\"fa fa-leaf\"></i> Realms',
                        name        : 'ldap_rba_'+role+'_cmp_realms'
                    },
                ]
            },
            {
                xtype       : 'checkboxgroup',
                userCls     : 'divGroup',
                columns     : 2,
                vertical    : true,
                disabled    : true,
                items   : [
                    {    
				        fieldLabel  : '<span style="font-family:FontAwesome;font-size:18px;">&#xf20e</span> Mesh Networks',
				        name        : 'ldap_rba_'+role+'_cmp_meshes'
			        },
			        {
				        fieldLabel  : '<i class=\"fa fa-cubes\"></i>  AP Profiles',
				        name        : 'ldap_rba_'+role+'_cmp_ap_profiles'
			        }
                ]
            },
            {
                xtype       : 'checkboxgroup',
                userCls     : 'divGroup',
                columns     : 2,
                vertical    : true,
                disabled    : true,
                items: [
                    {    
				        fieldLabel  : '<i class=\"fa fa-gears\"></i> Other',
				        name        : 'ldap_rba_'+role+'_cmp_other'
			        }
                ]
            }
        ];
        
        me.callParent(arguments);
    }
});
