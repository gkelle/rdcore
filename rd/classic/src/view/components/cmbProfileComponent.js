Ext.define('Rd.view.components.cmbProfileComponent', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbProfileComponent',
    fieldLabel      : 'Profile Component',
    labelSeparator  : '',
    forceSelection  : true,
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    typeAhead       : true,
    allowBlank      : false,
    name            : 'component_id',
    mode            : 'remote',
    pageSize        : 0, // The value of the number is ignore -- it is essentially coerced to a boolean, and if true, the paging toolbar is displayed.
    include_all_option : true, 
    initComponent   : function() {
        var me= this;
        var s = Ext.create('Ext.data.Store', {
        fields: ['id', 'name'],
        pageSize    : 1000,
        listeners: {
            load: function(store, records, successful) {
            	if(me.include_all_option){
					me.setValue(0); //reset the value of the combobox when reloading to all schedules
				}    
            },
            scope: me
        },
        proxy: {
                type    : 'ajax',
                format  : 'json',
                batchActions: true,
                pageSize: 1000,
                url     : '/cake4/rd_cake/profile-components/index-combo.json',
                reader: {
                    type            : 'json',
                    rootProperty    : 'items',
                    messageProperty : 'message',
                    totalProperty   : 'totalCount' //Required for dynamic paging
                }                              
            },
            autoLoad    : true
        });        
        if(me.include_all_option){
        	s.getProxy().setExtraParams({include_all_option: me.include_all_option });
        }             
        me.store = s;
        this.callParent(arguments);
    }
});
