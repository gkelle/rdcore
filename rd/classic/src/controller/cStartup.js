Ext.define('Rd.controller.cStartup', {
    extend  : 'Ext.app.Controller',
    config  : {
        urlCheckToken: '/cake4/rd_cake/dashboard/check_token.json'
    },
    actionIndex: function () {
        const me = this;
        // Use Ext.defer for consistency with ExtJS idioms
        
        //--Suspend the Router--
        Ext.route.Router.suspend();
        
        setTimeout(function(){
          Ext.get('loading').remove();
          Ext.get('loadSpin').fadeOut({remove:true});
          me.dashboardCheck();
        }, 250);
        
     /*   Ext.defer(() => {
            Ext.get('loading')?.remove();
            Ext.get('loadSpin')?.fadeOut({ remove: true });
            me.dashboardCheck();
        }, 250);*/
    },
 
    dashboardCheck: function () {
         
        const me    = this;
        const token = Ext.util.Cookies.get("Token");       
        if (!token) {
            Rd.getApplication().runAction('cLogin', 'Index');
            return;
        }

        me.checkToken(token)
            .then(me.handleValidToken.bind(me))
            .catch(function (error) {
                Ext.log({ level: 'warn', msg: 'Auth Error - ' + error });
                Rd.getApplication().runAction('cLogin', 'Index');
            });
    },

    // Verify token on backend
    checkToken: function (token) {
        const me = this;

        return new Ext.Promise(function (resolve, reject) {
            var screenSize = Ext.getBody().getViewSize().width,
                autoCompact = screenSize < 1000;

            Ext.Ajax.request({
                url: me.getUrlCheckToken(),
                method: 'GET',
                params: {
                    token: token,
                    auto_compact: autoCompact
                },
                success: function (response) {
                    var jsonData = Ext.JSON.decode(response.responseText);

                    if (jsonData.success) {
                        resolve(jsonData);
                    } else {
                        reject(response.status + ':' + response.statusText);
                    }
                },
                failure: function (response) {
                    reject(response.status + ':' + response.statusText);
                }
            });
        });
    },
    handleValidToken: function (authData) {
        if (!authData) return;
        const me    = this;
        const token = authData.data.token;
        Ext.Ajax.setExtraParams({
            token: token
        });
        Rd.getApplication().setDashboardData(authData.data);
        Rd.getApplication().runAction('cDashboard', 'Index');
    }
});

