Ext.define('Rd.store.sApViewClients', {
    extend  : 'Ext.data.Store',
    model   : 'Rd.model.mApViewClient',
    remoteSort: false,
    groupField: 'name',
    proxy: {
            type    : 'ajax',
            format  : 'json',
            url     : '/cake4/rd_cake/ap-reports/view-clients.json',
            reader  : {
                type            : 'json',
                rootProperty    : 'items',
                messageProperty : 'message',
                totalProperty   : 'totalCount' //Required for dynamic paging
            }
    },
    autoLoad: false
});
