Ext.define('Rd.view.settings.pnlSettingsLdap', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlSettingsLdap',
    autoScroll	: true,
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    margin      : 5,  
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth+20,
        margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRdReq'
    },
    buttons : [
        {
            itemId  : 'save',
            text    : 'SAVE',
            scale   : 'large',
            formBind: true,
            glyph   : Rd.config.icnYes,
            margin  : Rd.config.buttonMargin,
            ui      : 'button-teal'
        }
    ],
    requires: [
        'Rd.view.settings.vcSettingsLdap',
        'Rd.view.settings.winSettingsLdapTest',
        'Rd.view.settings.cntSettingsLdapRba'
    ],
    controller  : 'vcSettingsLdap',
    listeners       : {
        activate  : 'onViewActivate'
    },
    initComponent: function(){
        var me      = this;
        var w_prim  = 550;
             
        var cntLdap  = {
            xtype       : 'container',
            width       : w_prim,
            itemId      : 'cntLdap',
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            defaultType : 'textfield',
            items       : [
                { 
                    fieldLabel      : 'Enable', 
                    name            : 'ldap_enabled', 
                    itemId          : 'chkLdapEnabled',
                    labelClsExtra   : 'lblRdReq',
                    checked         : false, 
                    xtype           : 'checkbox'
                },
                {
                    xtype           : 'textfield',
                    fieldLabel      : 'LDAP Host',
                    name            : 'ldap_host',
                    allowBlank      : false,
                    disabled        : true
                },
                {
                    xtype           : 'textfield',
                    fieldLabel      : 'Bind DN',
                    name            : 'ldap_bind_dn',
                    allowBlank      : false,
                    disabled        : true
                },
                {
                    xtype           : 'rdPasswordfield',
                    rdName          : 'ldap_bind_password',
                    rdLabel         : 'Bind Password',
                    itemId          : 'txtLdapBindPassword',
                    disabled        : true
                },
                {
                    xtype           : 'textfield',
                    fieldLabel      : 'Base DN',
                    name            : 'ldap_base_dn',
                    allowBlank      : false,
                    disabled        : true
                },
                {
                    xtype           : 'textfield',
                    fieldLabel      : 'Filter',
                    name            : 'ldap_filter',
                    emptyText       : '(uid=%s) or (&(objectClass=user)(samaccountname=%s))',
                    allowBlank      : false,
                    disabled        : true
                },
                {
                    xtype           : 'textfield',
                    fieldLabel      : 'Port',
                    name            : 'ldap_port',
                    itemId          : 'txtLdapPort',
                    allowBlank      : false,
                    blankText       : i18n('sSupply_a_value'),
                    labelClsExtra   : 'lblRdReq',
                    vtype           : 'Numeric',
                    value           : 389,
                    minValue        : 1,
                    maxValue        : 65535,
                    disabled        : true
                },
                {
                    xtype           : 'checkbox',
                    boxLabel        : 'Use Secure Connection (LDAPS)',
                    boxLabelCls	    : 'boxLabelRd',
                    name            : 'ldap_use_ldaps',
                    disabled        : true,
                    listeners       : {
                        change: function (checkbox, newValue) {
                            let portField = checkbox.up('form').getForm().findField('ldap_port');
                            portField.setValue(newValue ? 636 : 389);
                        }
                    }
                },
                {
                    xtype           : 'button',
                    text            : 'Test LDAP Settings',
                    ui              : 'button-teal',
                    itemId          : 'btnLdapTest',
                    scale           : 'large',
                    padding         : 5,
                    margin          : 5,
                    disabled        : true,
                    listeners   : {
                        click     : 'onLdapTestClick'
                    }    
                }  
            ]
        }
        
        var cntLdapRba  = {
            xtype       : 'container',
            width       : w_prim,
            itemId      : 'cntLdapRba',
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            defaultType : 'textfield',
            items       : [
                { 
                    fieldLabel      : 'Enable', 
                    name            : 'ldap_rba_enabled', 
                    itemId          : 'chkLdapRbaEnabled',
                    labelClsExtra   : 'lblRdReq',
                    checked         : false, 
                    xtype           : 'checkbox'
                },
                {
                    xtype       : 'component',
                    html        : 'Common Settings',
                    cls         : 'heading',
                    margin      : '25 0 0 0'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Group Attribute',
                    name        : 'ldap_rba_group_attribute',
                    itemId      : 'txtLdapGroupAttribute',
                    allowBlank  : false,
                    disabled        : true
                },
                {
                    xtype       : 'cmbClouds',
                    fieldLabel  : 'Default Cloud',
                    name        : 'ldap_rba_cloud',
                    itemId      : 'cmbClouds',
                    disabled    : true
                },                                  
                {
                    xtype       : 'cmbRealm',
                    itemId      : 'cmbRealm',
                    name        : 'ldap_rba_realm',
                    allOption   : true,
                    disabled    : true,
                    fieldLabel  : 'Default Realm',
                    value       : 0
                },
                {
                    xtype       : 'component',
                    html        : 'Admin',
                    cls         : 'heading',
                    margin      : '25 0 0 0'
                },
                {
                    xtype       : 'cntSettingsLdapRba',
                    role        : 'admin'               
                },                
                {
                    xtype       : 'component',
                    html        : 'Operator',
                    cls         : 'heading',
                    margin      : '25 0 0 0'
                },
                {
                    xtype       : 'cntSettingsLdapRba',
                    role        : 'operator'               
                },             
                {
                    xtype       : 'component',
                    html        : 'View',
                    cls         : 'heading',
                    margin      : '25 0 0 0'
                },
                {
                    xtype       : 'cntSettingsLdapRba',
                    role        : 'view'               
                }               
              ]
        }        
                            
        me.items = [
            {
                xtype       : 'panel',
                title       : "General",
                glyph       : Rd.config.icnGears, 
                ui          : 'panel-blue',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntLdap				
            },
            {
                xtype       : 'panel',
                title       : "LDAP group to RBA mapping",
                glyph       : Rd.config.icnGroup,
                itemId      : 'pnlLdapRba',
                ui          : 'panel-green',
                disabled    : true,
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntLdapRba				
            }
        ];    
        me.callParent(arguments);
    }
});
