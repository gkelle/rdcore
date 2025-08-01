Ext.define('Rd.controller.cLogin', {
    extend  : 'Ext.app.Controller',

    views   : ['login.pnlLogin'],

    config  : {
        urlLogin     : '/cake4/rd_cake/dashboard/authenticate.json',
        urlBranding  : '/cake4/rd_cake/dashboard/branding.json',
        urlWallpaper : 'resources/images/wallpapers/2.jpg'
    },

    refs: [
        { ref: 'viewP',    selector: 'viewP',     xtype: 'viewP',     autoCreate: true },
        { ref: 'pnlLogin', selector: 'pnlLogin',  xtype: 'pnlLogin',  autoCreate: false }
    ],

    init: function () {
        const me = this;

        if (me.inited) {
            return;
        }
        me.inited = true;

        me.control({
            '#winLogin button[type="submit"]': {
                click: me.login
            },
            '#inpPassword': {
                specialkey: function (field, e) {
                    if (e.getKey() === e.ENTER) {
                        const form = field.up('form');
                        const submitBtn = form.down('button[type="submit"]');
                        submitBtn.fireEvent('click', submitBtn);
                    }
                }
            }
        });
    },

    actionIndex: function () {
        const me = this;

        Ext.Ajax.request({
            url    : me.getUrlBranding(),
            method : 'GET',
            success: function (response) {
                const jsonData = Ext.JSON.decode(response.responseText);

                if (jsonData.success) {
                    const loginPanel = me.getView('login.pnlLogin').create(jsonData.data);
                    const viewport = me.getViewP();
                    viewport.removeAll(true);
                    viewport.add([loginPanel]);
                }
            },
            scope: me
        });
    },

    login: function (button) {
        const me    = this;
        const win   = button.up('#winLogin');
        const form  = win.down('form');
        
        const autoCompact = Ext.getBody().getViewSize().width < 1000;

        form.submit({
            clientValidation: true,
            url: me.getUrlLogin(),
            params: {
                auto_compact: autoCompact
            },
            success: function (form, action) {
                const app = Ext.getApplication();
                const data = action.result.data;

                app.setDashboardData(data);

                // Set token cookie for 1 day
                const expires = new Date();
                expires.setDate(expires.getDate() + 1);
                Ext.util.Cookies.set("Token", data.token, expires, "/", null, false);

                Ext.Ajax.setExtraParams({
                    token: data.token
                });

                // Redirect to dashboard
                me.getViewP().removeAll(true);
                win.close();
                me.application.runAction('cDashboard','Index');
            },
            failure: Ext.ux.formFail
        });
    },

    actionExit: function () {
        const me = this;
        me.getViewP().removeAll(true);
        Ext.util.Cookies.clear("Token");
        Ext.Ajax.setExtraParams({});
        me.actionIndex();
    }
});

