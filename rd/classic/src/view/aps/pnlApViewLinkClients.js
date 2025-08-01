Ext.define('Rd.view.aps.pnlApViewLinkClients', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlApViewLinkClients',
    apId        : undefined,
    requires    : [
        'Rd.view.aps.cmbApViewSsids'
    ],
    layout      : 'card',
    requires: [
        'Rd.view.aps.vcApViewLinkClients',
        'Rd.view.aps.gridApViewLinkClients',
        'Rd.view.aps.pnlApViewEntriesGraph',
        'Rd.view.aps.winApEditMacAlias',
        'Rd.view.aps.winApEditMacLimit',
        'Rd.view.aps.winApEditMacBlock',
        'Rd.view.aps.winApEditMacFirewall'  
    ],
    controller  : 'vcApViewLinkClients',
    initComponent: function() {
        var me   = this;            
        me.tbar  = [
            {   
                xtype   : 'button', 
                glyph   : Rd.config.icnReload , 
                scale   : 'small', 
                itemId  : 'reload',   
                tooltip : i18n('sReload'),
                ui      : 'button-orange'
            },
            {
                xtype       : 'cmbApViewSsids',
                width       : 250,
                labelWidth  : 50,
                apId        : me.apId
            },
            '|',
            {   
                xtype       : 'button', 
                text        : '1 Hour',    
                toggleGroup : 'time_n', 
                enableToggle : true,
                scale       : 'small', 
                itemId      : 'hour', 
                pressed     : true,
                ui          : 'button-metal'
            },
            { 
                xtype       : 'button', 
                text        : '24 Hours',   
                toggleGroup : 'time_n', 
                enableToggle : true, 
                scale       : 'small', 
                itemId      : 'day',
                ui          : 'button-metal' 
            },       
            { 
                xtype       : 'button', 
                text        : '7 Days',     
                toggleGroup : 'time_n', 
                enableToggle : true, 
                scale       : 'small', 
                itemId      : 'week',
                ui          : 'button-metal'
            },
            '|',
            
            { 
                xtype       : 'button',   
                toggleGroup : 'graph_list', 
                enableToggle : true, 
                scale       : 'small', 
                itemId      : 'list',
                pressed     : true,
                ui          : 'button-metal',
                glyph       : Rd.config.icnTable
            },
             { 
                xtype       : 'button',   
                toggleGroup : 'graph_list', 
                enableToggle : true, 
                scale       : 'small', 
                itemId      : 'graph',             
                ui          : 'button-metal',
                glyph       : Rd.config.icnGraph
            },
            { 
                scale       : 'small',
                itemId      : 'btnBack',
                glyph       : Rd.config.icnBack,  
                text        : 'Back',
                hidden      : true,
                ui          : 'button-pink'
            }
        ];
             
        me.items = [  
            { 
                xtype   : 'gridApViewLinkClients', 
                apId    : me.apId,
                style   : {
                    borderTopColor  : '#d1d1d1',
                    borderTopStyle  : 'solid',
                    borderTopWidth  : '1px'
                }
            },                   
            { 
                xtype   : 'pnlApViewEntriesGraph',
                role    : 'entries',
                apId    : me.apId,
                margin  : '0 5 0 5'
            }         
        ];     
        me.callParent(arguments);
    }
});
