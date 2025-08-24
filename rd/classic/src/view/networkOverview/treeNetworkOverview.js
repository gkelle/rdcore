Ext.define('Rd.view.networkOverview.treeNetworkOverview' ,{
    extend      :'Ext.tree.Panel',
    useArrows   : true,
    alias       : 'widget.treeNetworkOverview',
    rootVisible : false,
    rowLines    : true,
    stripeRows  : true,
    border      : false,
    location    : 'overview',
    doFirstLoad : true,
    initComponent: function(){
        var me      = this;       
        me.store    = Ext.create('Ext.data.TreeStore', {
            proxy   : {
                type    : 'ajax',
                url     : '/cake4/rd_cake/clouds/index-online.json',
                extraParams: {'location': me.location},
                reader: {
                    type            : 'json',
                    rootProperty    : 'items',
                    totalProperty   : 'total',
                    successProperty : 'success',
                }
            },
            rootProperty: 'items',
            autoLoad    : true,
            listeners: {
                load: function(store, records, successful, operation) {
                    if(successful){
                        if(me.doFirstLoad){
                            var dd  = Ext.getApplication().getDashboardData(); 
                            if(dd.user.cloud_id){
                                var node = store.getNodeById('Clouds_'+dd.user.cloud_id);
                            }else{
                                //get first node (if available)
                                var root = store.getRoot();
                                if (root.hasChildNodes()) {
                                    node = root.firstChild; // first top-level node
                                }
                            }                      

                            if (node) {
                                me.getSelectionModel().select(node); // select it
                                me.getView().focusRow(node);         // optional: scroll into view
                                // Fire the same event as a real click
                                me.fireEvent('itemclick', me, node, me.getView().getNode(node), 0, null);
                                me.doFirstLoad = false;
                            }
                        }
                    }
                }
            },
        });
        me.callParent(arguments); 
    }
});
