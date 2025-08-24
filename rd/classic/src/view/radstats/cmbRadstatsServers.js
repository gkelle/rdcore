Ext.define('Rd.view.radstats.cmbRadstatsServers', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbRadstatsServers',
    forceSelection  : true,
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    typeAhead       : true,
    allowBlank      : false,
    mode            : 'local',
    name            : 'radstats_server_id',
    labelClsExtra   : 'lblRd',
    allOption       : false,
    initComponent: function() {
        var me  = this;
        var s   = Ext.create('Ext.data.Store', {
          //  model: 'Rd.model.mRealm',
            proxy: {
                type            : 'ajax',
                format          : 'json',
                batchActions    : true, 
                url             : '/cake4/rd_cake/radstats/index-servers.json',
                reader: {
                    type            : 'json',
                    rootProperty    : 'items',
                    messageProperty : 'message'
                }
            },
            autoLoad : true
        });        
        s.getProxy().setExtraParam('all_option',me.allOption);        
        me.store = s;
        this.callParent(arguments);
    }
});
