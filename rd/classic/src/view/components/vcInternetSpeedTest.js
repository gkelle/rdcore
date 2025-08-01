Ext.define('Rd.view.components.vcInternetSpeedTest', {
    extend      : 'Ext.app.ViewController',
    alias       : 'controller.vcInternetSpeedTest',
       
    config      : {
        UrlStartTest : '/cake4/rd_cake/mqtt/start-speedtest.json'
    },        
    control: {
        '#btnSpeedTestStart' : {
            click : 'onSpeedTestStart'
        }
    }, 
    
    init: function(view) {
        const me = this;
        view.on('beforedestroy', me.cleanupSocket, me);
    },
    
    onSpeedTestStart: function () {
        const me = this;     
        me.updateBasics({}); //Clear first
        me.updateBasics({ul_live:0,dl_live:0}); //Clear first
        me.updateGauges({ul_live:0,dl_live:0});
        
        var mode    = me.getView().dev_mode;
        var id      = me.getView().dev_id;   
        
        var values = {
            dev_mode : mode,
            dev_id   : id        
        }
        
        Ext.Ajax.request({
            url		: me.getUrlStartTest(),
            method	: 'POST',          
            jsonData: values,
            success	: function(batch,options){
                Ext.ux.Toaster.msg(
                    'Speedtest Started',
                    'Speedtest Started',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },                                    
            failure: function(batch,options){
                console.log("Speed Test Failure")
            }
        });
           
        const btn           = me.getView().down('#btnSpeedTestStart');
        let testTimedOut    = false;
        let testDone        = false;

        btn.setDisabled(true);
        btn.setText('Running...');
        
        // Connect (or reuse) WebSocket
        if (!me.ws || me.ws.readyState !== WebSocket.OPEN) {
        
            const wsHost = window.location.hostname;
            me.ws       = new WebSocket('ws://' + wsHost + ':8080/');           
            
            // Subscribe to MQTT topic when WS is open
            me.ws.onopen = function () {
                me.ws.send(JSON.stringify({
                    action  : 'subscribe',
                    topic   : '/'+mode+'/'+id+'/speedtest'  // use your actual dynamic AP ID if needed
                }));
            };
        }

        // Handle incoming WebSocket messages
        me.ws.onmessage = function (event) {
            const data = JSON.parse(event.data);
            
            var statsData = {};
            if(data.ul_live){
                statsData.ul_live = data.ul_live
            }
            if(data.dl_live){
                statsData.dl_live = data.dl_live
            }                      
                       
            me.updateGauges(data);
            me.updateBasics(data);

            if (data.upload) { // Done condition
                testDone = true;
                me.finishSpeedTest();
            }
        };
                
        me.ws.onerror = function(error) {
            console.error('WebSocket Error:', error);
        };

        me.ws.onclose = function() {
            console.log('WebSocket connection closed');
        };

        // Timeout fallback (e.g. after 10 seconds)
        Ext.defer(function () {
            if (!testDone) {
                testTimedOut = true;
                me.finishSpeedTest();
            }
        }, 60000);
    },

    finishSpeedTest: function () {    
        const me = this;
        if(me.getView()){   
            var btn = me.getView().down('#btnSpeedTestStart');
            btn.setDisabled(false);
            btn.setText('Start Speedtest');
        }
    },    
    updateBasics : function(newData){
        const me = this;
        console.log(newData);
        var view = me.getView().down('#cmpSpeedDispaly');
        view.setData(newData);    
    },
    updateGauges : function(newData){
        const me = this;
        if(newData.dl_live){
            me.getView().down('#gauDownload').setValue(newData.dl_live/2); 
        }

        if(newData.ul_live){
            me.getView().down('#gauUpload').setValue(newData.ul_live); 
        }
    },
    cleanupSocket: function() {
        if (this.ws) {
            console.log('Closing WebSocket');
            this.ws.close();
            this.ws = null;
        }
    }

});
