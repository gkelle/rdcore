Ext.define('Rd.view.components.pnlInternetSpeedTest', {
    extend      : 'Ext.panel.Panel',
    alias       :'widget.pnlInternetSpeedTest',
    controller  : 'vcInternetSpeedTest',
    dev_mode    : null,
    dev_id      : null,
    requires    : [
        'Rd.view.components.vcInternetSpeedTest',
        'Ext.ux.gauge.Gauge'
    ],
    layout: {
        type    : 'vbox',
        align   : 'stretchmax'
    },
    width       : 400,
    scrollable  : true,
    initComponent: function() {
        const me = this;                             
        var cntGauges = {
            xtype       : 'container',
            layout  : {
                type    : 'hbox',
                align   : 'stretch',
                pack    : 'center'
            },
            height      : 200,
            items   : [
                {
                    xtype   : 'gauge',
                    itemId  : 'gauDownload',
                    value   : 0,
                    textTpl: 'Download'
                }, 
                {
                    xtype   : 'gauge',
                    itemId  : 'gauUpload',
                    value   : 0,
                    textTpl: 'Upload'
                }
            ]
        }
        
        me.items = [
            {
                xtype   : 'container',
                html    : '<h3>Internet Speed Test</h3>'    
            },
            cntGauges,          
            {
                xtype   : 'component',
                itemId  : 'cmpSpeedDispaly',
                tpl: new Ext.XTemplate(
                    '<div class="speedtest-stats-container">',
                        '<div class="speedtest-stat">',
                            '<div class="speedtest-value" id="{id}-download">{dl_live} Mbps</div>',
                            '<div class="speedtest-label">Download</div>',
                        '</div>',
                        '<div class="speedtest-stat">',
                            '<div class="speedtest-value" id="{id}-upload">{ul_live} Mbps</div>',
                            '<div class="speedtest-label">Upload</div>',
                        '</div>',
                    '</div>',
                       
                    '<div class="speedtest-secondary" style="height: 120px;">',
                                      
                        // Jitter
                        '<div class="speedtest-secondary-item"><b>Jitter:</b> ',
                            '<tpl if="typeof jitter !== \'undefined\'">',
                                '{jitter} ms',
                            '<tpl else>',
                                '-- ms',
                            '</tpl>',
                        '</div>',
                        
                         //Ping
                        '<div class="speedtest-secondary-item"><b>Ping:</b> ',
                            '<tpl if="typeof ping !== \'undefined\'">',
                                '{ping} ms',
                            '<tpl else>',
                                '-- ms',
                            '</tpl>',
                        '</div>',

                        // Server
                        '<div class="speedtest-secondary-item"><b>Server:</b> ',
                            '<tpl if="server">',
                                '{server.host} ({server.name} / {server.distance} km) - {server.sponsor}',
                            '<tpl else>',
                                '--',
                            '</tpl>',
                        '</div>',

                        // Client
                        '<div class="speedtest-secondary-item"><b>Client:</b> ',
                            '<tpl if="client">',
                                '{client.ip} ({client.isp})',
                            '<tpl else>',
                                '--',
                            '</tpl>',
                        '</div>',
                    '</div>'
                ),
                data: {
                    id      : Ext.id(),
                    ul_live : 0,
                    dl_live : 0             
                },
                style: {
                    padding: '10px'
                }
            },
            {
                xtype   : 'container',
                layout  : {
                    type    : 'hbox',
                    align   : 'stretchmax'
                },
                items   : [ 
                    {
                        xtype   : 'button',
                        text    : 'History',
                        itemId  : 'btnSpeedTestHisory',
                        scale   : 'large',
                        padding : 5,
                        margin  : 5,
                        flex    : 1
                    },              
                    {
                        xtype   : 'button',
                        text    : 'Start Speed Test',
                        ui      : 'button-teal',
                        itemId  : 'btnSpeedTestStart',
                        scale   : 'large',
                        padding : 5,
                        margin  : 5,
                        flex    : 1
                    },
                    
                ]
            }          
        ];           
        this.callParent(arguments);
    },
});


