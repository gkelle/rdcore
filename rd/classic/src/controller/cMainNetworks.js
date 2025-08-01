//127.0.0.1/rd/#cloud/23/NETWORK|network_active/nodes|ap_action/view/300

Ext.define('Rd.controller.cMainNetworks', {
    extend: 'Ext.app.Controller',
    config: {
        urlGetContent   : '/cake4/rd_cake/dashboard/items-for.json',
        activeTab       : null,
        processingRoute : false   
    },    
    init: function() {
        const me  = this;           
        if (me.inited) {
            return;
        }
        me.inited = true;  
        me.control({
            '#tabMainNetworks': {
                tabchange: me.onTabChanged
            }
        });        
    },
    refs: [
        {   ref: 'tabMainNetworks',   	selector: '#tabMainNetworks',          xtype: 'tabpanel',    autoCreate: false}
    ],
    
    onTabChanged: function(tabPanel, newCard, oldCard) {
        const me = this;
        console.log('Tab changed to:', newCard.title || newCard.itemId);
        console.log('Tab ID:', newCard.itemId);
        me.clickTabActive(newCard.itemId);
    },
     
    routes: {
        'network_active/:activeTab' : {
            action  : 'onTabActive',
            lazy    : true,
            before  : 'beforeTabActive',
            name    : 'networkActive'      
        }
    },    
      
    beforeTabActive : function(tabId, action){
        const me = this;       
        Ext.log("=== BEFORE Network Tab Active === "+tabId);
        
        if (this.getProcessingRoute() || tabId === this.getActiveTab() ) {
            action.stop();
            return false;
        }
        
        this.setProcessingRoute(true);
        action.resume();
    },
       
    onTabActive : function(tabId){
        const me = this;
        Ext.log("=== Network Tab Active === "+tabId);
        this.setActiveTab(tabId);
        this.urlTabActive(tabId);
        this.setProcessingRoute(false);
    },
    
    clickTabActive : function(tabId){
        const me = this;     
        if(me.validateTab(tabId)){
            Ext.log("=== CLICK Tab Active === "+tabId);
            this.redirectTo({networkActive: 'network_active/'+tabId});
        }  
    },
    
    urlTabActive: function(tabId){
        const me =this;
        if(me.validateTab(tabId)){
            Ext.log("=== URL Tab Active === "+tabId);
            me.getTabMainNetworks().setActiveTab(tabId);
        }     
    },
       
    validateTab: function(tab) {
        // Implement your page validation logic
        return ['mesh_networks', 'nodes', 'ap_profiles', 'aps', 'arrivals'].includes(tab);
    },
           
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        console.log(itemId);
        var added   = false;
                   
        if(!item){
            var tp = Ext.create('Ext.tab.Panel',
            	{          
	            	border  : false,
	                itemId  : itemId,
	                plain	: true,
	                cls     : 'subSubTab', //Make darker
	            });      
            pnl.add(tp);
            Ext.Ajax.request({
                url     : me.getUrlGetContent(),
                method  : 'GET',
                params  : { item_id : itemId },
                success : function (response) {
                    var jsonData = Ext.JSON.decode(response.responseText);
                    if (jsonData.success) {
                        var items = jsonData.items;
                        if(items.meshes){
                            Ext.getApplication().runAction('cMeshes','Index',tp); 
                            added = true;                      
                        }
                        if(items.ap_profiles){
                            Ext.getApplication().runAction('cAccessPoints','Index',tp);
                            added = true;
                        }
                        if(items.unknown_nodes){
                            Ext.getApplication().runAction('cUnknownNodes','Index',tp);
                            added = true;
                        }
                        // Set the first tab active, if there are any tabs - or set it to the link in the routes (|network_active/aps)
                        if (tp.items.getCount() > 0) {
                            if(this.getActiveTab()){
                                tp.setActiveTab(this.getActiveTab());
                            }else{
                                tp.setActiveTab(0);
                            }
                        }
                    }
                },
                scope: me
            });
            added = true;
        }
        return added;      
    }
});
