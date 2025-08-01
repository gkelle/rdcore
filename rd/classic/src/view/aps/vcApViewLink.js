Ext.define('Rd.view.aps.vcApViewLink', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.vcApViewLink',
    control: {
        '#btnMoreInfo': {
             click: 'btnMoreInfoClicked'
        },
        '#cardAccessPoint' : {
			activate    : 'activateAccessPoint'
		},
    },
    
    showCard: function(cardId) {
        const holder = this.lookup('pnlCardHolder') || this.getView().down('#pnlCardHolder');
        const card = holder.down('#' + cardId);
        holder.getLayout().setActiveItem(card);
    },

    onInternetClick: function() {
        this.showCard('cardInternet');
    },

    onApClick: function() {
        this.showCard('cardAccessPoint');
    },

    onClientsClick: function() {
        this.showCard('cardClients');
    },
    
    btnMoreInfoClicked: function(){
        const me    = this;
        var ap_id   = me.getView().ap_id;
        Ext.getApplication().runAction('cAccessPointViews','Index',ap_id,me.getView().ap_name);    
    },
    activateAccessPoint: function(){
        const me    = this;
        var ap_id   = me.getView().ap_id;
        Ext.Ajax.request({
            url     : '/cake4/rd_cake/aps/get-info.json', 
            params  : {
                apId: ap_id
            },
            method  : 'GET',
            success : function(response) {
                var jsonData = Ext.JSON.decode(response.responseText);
                if (jsonData.success) {
                    me.getView().down('#cardAccessPoint').setData(jsonData.data); 
                    apId: me.getView().setTitle(jsonData.data.name); 
                    me.getView().ap_name = jsonData.data.name;
                }
            },
            failure: function() {
                consloe.log("Could not get info on AP with ID "+ap_id);
            }
        });  
    }
});
