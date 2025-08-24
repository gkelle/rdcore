Ext.define('Rd.view.permanentUsers.vcPermanentUserRealtime', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcPermanentUserRealtime',
    init    : function() { 
        this.startTask();   
    },
    config: {
        urlUserStats: '/cake4/rd_cake/realtime-stats/user-stats.json',
        pollSpan    : 300,
        pollSpanDc  : 300,
        pollInt     : 10,
        pollIntDc   : 10
    },
    control: {
        'pnlPermanentUserRealtime #reload': {
            click   : 'reload'
        },
        'pnlPermanentUserRealtime #add': {
            click   : 'add'
        },
        'pnlPermanentUserRealtime #sldrInterval': {
            change   : 'intChange'
        },
        'pnlPermanentUserRealtime' : {
            beforedestroy : 'onDestroy'
        } 
    },
    reload: function(){
        var me      = this;
        console.log("Reload Screen");
        me.doPoll();       
    },
    onViewActivate: function(pnl){
        var me = this;
        me.reload();   
    },
    add: function(){
        var me = this;
        me.setPollSpan(me.getPollSpan()+30)
        me.setPollSpanDc(me.getPollSpanDc()+30);  
    },
    intChange: function(){
        var me  = this;
        var int = me.getView().down('#sldrInterval').getValue();
        me.setPollInt(int);
        me.setPollIntDc(int);        
    },
    startTask: function() {
        const me = this;      
        me.task = Ext.TaskManager.start({
            run: function() {
                //console.log('Task running every second:', new Date());
                //-- Poll span (big value)
                var span_dc = me.getPollSpanDc();
                if(span_dc == 0){
                    Ext.TaskManager.stop(me.task);
                }else{
                    me.setPollSpanDc(span_dc-1)
                }
                
                //-- Poll interval (small value)
                var int_dc = me.getPollIntDc();
                if(int_dc == 0){
                    me.setPollIntDc(me.getPollInt());
                    me.doPoll();
                }else{
                    me.setPollIntDc(int_dc-1)
                }
                                                               
                var cmpInfo = me.getView().down('#cmpInfo');
                if(cmpInfo){
                    var d = {
                        pollSpan        : me.getPollSpanDc(),
                        pollInterval    : me.getPollIntDc(),
                    }
                    cmpInfo.setData(d);
                }
            },
            interval: 1000, // Runs every 1 second
            repeat: Infinity, // Keep running indefinitely
            scope: me
        });
    },

    onDestroy : function() {
        if (this.task) {
            Ext.TaskManager.stop(this.task);
        }
    },
    doPoll : function(){
        var me      = this;
        var user    = 'ord555@radiusdesk';
        var span    = me.getPollSpan();
        var int     = me.getPollInt();
        Ext.Ajax.request({
            url     : me.getUrlUserStats(),
            method  : 'GET',
            params  : {username : user, span: span, interval: int },
            success : function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    me.getView().down('#pnlForLastStats').setData(jsonData.data.last_stats);
                    me.getView().down('#crtPackets').getStore().setData(jsonData.data.chart);
                    console.log("Update Screen...");  
                }   
            },
            scope: me
        });    
    }
});
