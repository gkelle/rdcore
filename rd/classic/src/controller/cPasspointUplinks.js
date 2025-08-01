Ext.define('Rd.controller.cPasspointUplinks', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){
            var tp = Ext.create('Ext.tab.Panel',
            	{          
	            	border  : false,
	                itemId  : itemId,
	                plain	: true,
	                cls     : 'subSubTab', //Make darker -> Maybe grey
	                tabBar: {
                        items: [
                            { 
                                xtype   : 'btnOtherBack'
                            }              
                       ]
                    },
	                items   : [
	                    { 
	                        title   : 'WPA-ENTERPRISE/HS2.0 UPLINKS', 
	                        xtype   : 'gridPasspointUplinks',
	                        border  : false,
                            plain   : true,
                            padding : '0 5 0 5',
	                        glyph   : 'xf1eb@FontAwesome',
	                        padding : Rd.config.gridSlim,
	                    }
	                ]
	            });      
            pnl.add(tp);
            added = true;
        }
        return added;      
    },
    views:  [
    	'passpointUplinks.gridPasspointUplinks'
    ],
    stores: ['sPasspointUplinks'],
    models: ['mPasspointUplink']
});
