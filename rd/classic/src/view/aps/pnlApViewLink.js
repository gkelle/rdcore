Ext.define('Rd.view.aps.pnlApViewLink', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlApViewLink',
    ap_id       : undefined,
    apName      : undefined,    
    controller  : 'vcApViewLink',
    requires    : [
        'Rd.view.aps.vcApViewLink',
        'Rd.view.aps.pnlApViewLinkInternet',
        'Rd.view.components.pnlInternetSpeedTest',
        'Rd.view.aps.pnlApViewLinkClients'
    ],
    initComponent: function() {
        var me      = this;
        me.setTitle('AP VIEW LINK');
        me.callParent(arguments);
    },    
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    initComponent: function() {
        const me = this;   
        
        console.log("---Get info for--- "+me.ap_id);
        
              
        me.items = [
           /* {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'middle',
                    pack: 'center'
                },
                height: 80,
                cls: 'banner-container',
                defaults: {
                    xtype: 'button',
                    scale: 'large',
                    margin: '0 20 0 20',
                    ui: 'default-toolbar'
                },
                items: [
                    {
                        text: 'Internet',
                        iconCls: 'x-fa fa-globe',
                        handler: 'onInternetClick'
                    },
                    {
                        text        : 'Access Point',
                        iconCls     : 'x-fa fa-wifi',
                        handler     : 'onApClick'
                    },
                    {
                        text: 'Clients',
                        iconCls: 'x-fa fa-users',
                        handler: 'onClientsClick'
                    }
                ]
            },*/
            {
    xtype: 'container',
    layout: {
        type: 'hbox',
        align: 'middle',
        pack: 'center'
    },
    height: 70,
    cls: 'banner-c',
    items: [
        { xtype: 'box', flex: 1 },
        {
            xtype: 'box',
            itemId: 'lnkInternet',
            cls: 'banner-link',
            html: '<i class="x-fa fa-globe fa-2x"></i><br>Internet',
            listeners: {
                render: function(cmp) {
                    cmp.getEl().on('click', function() {
                        const parent = cmp.up('panel');
                        const controller = parent.getController();

                        parent.down('#lnkAccessPoint').removeCls('selected');
                        parent.down('#lnkClients').removeCls('selected');

                        // Add 'selected' class to this one
                        cmp.addCls('selected');

                        // Show the corresponding card
                        controller.showCard('cardInternet'); // or cardAccessPoint / cardClients
                    });

                }
            }
        },
        { xtype: 'box', width: 60, cls: 'connector-line' },
        {
            xtype: 'box',
            itemId: 'lnkAccessPoint',
            cls: 'banner-link selected',
            html: '<i class="x-fa fa-wifi fa-2x"></i><br>Access Point',
            listeners: {
                render: function(cmp) {                
                    cmp.getEl().on('click', function() {
                        const parent = cmp.up('panel');
                        const controller = parent.getController();                      
                        parent.down('#lnkInternet').removeCls('selected');
                        parent.down('#lnkClients').removeCls('selected');

                        // Add 'selected' class to this one
                        cmp.addCls('selected');

                        // Show the corresponding card
                        controller.showCard('cardAccessPoint'); // or cardAccessPoint / cardClients
                    });
                }
            }
        },
        { xtype: 'box', width: 60, cls: 'connector-line' },
        {
            xtype: 'box',
            itemId: 'lnkClients',
            cls: 'banner-link',
            html: '<i class="x-fa fa-tv fa-2x"></i><br>Clients',
            listeners: {
                render: function(cmp) {
                    cmp.getEl().on('click', function() {
                        const parent = cmp.up('panel');
                        const controller = parent.getController();

                        parent.down('#lnkInternet').removeCls('selected');
                        parent.down('#lnkAccessPoint').removeCls('selected');

                        // Add 'selected' class to this one
                        cmp.addCls('selected');

                        // Show the corresponding card
                        controller.showCard('cardClients'); // or cardAccessPoint / cardClients
                    });
                }
            }
        },
        { xtype: 'box', flex: 1 },
        {
            xtype       : 'button',
            scale       : 'large',
            margin      : 10,
            ui          : 'default-toolbar',
            text        : 'More Info',
            iconCls     : 'x-fa fa-plus',
            itemId      : 'btnMoreInfo'
        }
        
    ]
},

            {
                xtype       : 'container',
                itemId      : 'pnlCardHolder',
                layout      : 'card',
                flex        : 1,
                activeItem  : 1,  // Index of the item to show by default (0 = first, 1 = second, etc.)
                items: [ 
                    {
                        xtype   : 'pnlInternetSpeedTest',
                        dev_mode: 'ap',
                        dev_id  : me.ap_id,
                        itemId  : 'cardInternet',
                        padding : 20
                    },                 
                    {
                        xtype   : 'panel',
                        itemId  : 'cardAccessPoint',
                        tpl     : new Ext.XTemplate(
                            "<div>",
                            '<div style="color: #29495b;background: linear-gradient(135deg, #e6f0ff, #cce0ff, #99ccff);box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);padding:5px;">',
                                '<img src="/cake4/rd_cake/img/hardwares/{hw_photo}" alt="{hw_human}" style="float: left; padding-right: 20px;">',
                                '<p style="font-size: 22px;font-weight:400;color:#29495b;">{name}</p>',
                                '<span>{hw_human}</span>',
                                '</div>',

                                 '<div style="background: linear-gradient(135deg, #d3d3d3, #a9a9a9, #808080);color: #29495b;box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);padding: 10px;font-size: 16px;">',        
                                    'DEVICE INFORMATION (for the past hour)',
                                '</div>',
                                "<div style='background-color:white;padding:5px;font-size:120%;color:#29495b;'>",    
                                    "<tpl if='state == \"never\"'>",
                                    "<div style='color:blue;margin:10px;'><i class='fa fa-question-circle'></i>  Never connected before</div>",
                                    "</tpl>",
                                    "<tpl if='state == \"down\"'>",
                                    "<div style='color:red;margin:10px;'><i class='fa fa-exclamation-circle'></i>  Offline (last check-in <b>{last_contact_human}</b>).</div>",
                                    "</tpl>",
                                    "<tpl if='state == \"up\"'>",
                                    '<div style="color:green;margin:10px;"><i class="fa fa-check-circle"></i>  Online (last check-in <b>{last_contact_human}</b> ago).</div>',
                                    "</tpl>",
                                    '<div style="margin:10px;"><i class="fa fa-info-circle"></i>  Public IP <b>{last_contact_from_ip}</b>.</div>',
                                    '<tpl for="ssids">',
                                        '<div style="margin:10px;"><i class="fa fa-wifi"></i>  <b>{name}</b> had <b>{users}</b> users. (Data used: {data}.)</div>',
                                    '</tpl>', 
                                    '<div style="margin:10px;"><i class="fa fa-database"></i>  Total data usage <b>{data_past_hour}</b>.</div>',                                                                                     
                                    '<div style="margin:10px;"><i class="fa fa-link"></i>  Last connection from <b>{newest_station}</b> which was <b>{newest_time}</b> ({newest_vendor}).</div>',
                                     "<div style='color:blue;margin:10px;'><i class='fa fa-info-circle'></i>  LAN IP: {lan_ip} LAN Gateway: {lan_gw}  ({lan_proto}) </div>",
                                "</div>",
                                "</div>"
                            ),
                        data    : {},    
                       // padding : 20
                    },                  
                    {
                        xtype   : 'panel',
                        itemId  : 'cardClients',
                        apId    : me.ap_id,
                        xtype   : 'pnlApViewLinkClients'
                    }
                ]
            }
        ];
        
        this.callParent(arguments);
    }
});
