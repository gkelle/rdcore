Ext.define('Rd.view.aps.pnlAccessPointView', {
    extend      : 'Ext.tab.Panel',
    alias       : 'widget.pnlAccessPointView',
    border      : false,
    plain       : true,
    cls         : 'subTab',
    tabPosition : 'top',
    ap_id       : undefined,
    apName      : undefined,
    requires    : [
        'Rd.view.aps.pnlApViewSqm',
        'Rd.view.aps.pnlApViewWan',
        'Rd.view.aps.pnlApViewHardware',
        'Rd.view.aps.gridApViewActions',
        'Rd.view.aps.pnlApViewSqm'
    ],
    initComponent: function() {
        var me      = this;
        me.items    = [
            {
                title   : 'SQM STATS',
                itemId  : 'tabApViewSqm',
                xtype   : 'pnlApViewSqm',
                apId    : me.ap_id
            },
            {
                title   : 'WAN STATS',
                itemId  : 'tabApViewWan',
                xtype   : 'pnlApViewWan',
                apId    : me.ap_id
            },
		/*    {
                title   : 'HARDWARE',
                itemId  : 'tabApViewHardware',
                xtype   : 'pnlApViewHardware',
                apId    : me.ap_id
            },*/
            {
                title   : "COMMAND EXECUTION",
                itemId  : 'tabApViewActions',
                xtype   : 'gridApViewActions',
                apId    : me.ap_id
            }              
        ];
        me.callParent(arguments);
    }
});
