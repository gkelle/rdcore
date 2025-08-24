Ext.define('Rd.view.permanentUsers.pnlPermanentUserRealtime', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlPermanentUserRealtime',
    border  : false,
    pu_id   : null,
    pu_name : null,
    record  : null, //We will supply each instance with a reference to the selected record.
    plain   : true,
    listeners       : {
        activate  : 'onViewActivate'
    },
    layout  : {
        type        : 'fit'
    },
    requires    : [
        'Rd.view.permanentUsers.vcPermanentUserRealtime'
    ],
    controller  : 'vcPermanentUserRealtime',
    initComponent: function(){
    
        var me  = this;
        var m   = 5;
        var p   = 5; 
        
        me.tbar = [{
            xtype: 'buttongroup',
            title: '',
            items: [
                {
                    scale   : 'large',
                    tooltip : 'Poll Now',
                    glyph   : Rd.config.icnReload,
                    itemId  : 'reload', 
                    ui      : 'button-orange'
                },
                {
                    scale   : 'large',
                    tooltip : 'Add 30 Seconds<br>Poll Time',
                    glyph   : Rd.config.icnAdd,
                    itemId  : 'add',
                    ui      : 'button-green'
                },
                {
                    fieldLabel      : 'Poll Interval',
                    labelClsExtra   : 'lblRd',
                    xtype           : 'slider',
                    width           : 300,
                    margin          : '8 10 0 20',
                    value           : 10,
                    increment       : 1,
                    minValue        : 1,
                    maxValue        : 60,
                    labelAlign      : 'left',
                    labelSeparator  : '',
                    itemId          : 'sldrInterval'
                }                          
            ]
        },
        {
            xtype   : 'container', 
            itemId  : 'cmpInfo',            
            tpl     : [
                "<div>",
                "Next poll in  <span style='color:#5c5f63;'>{pollInterval}</span> seconds",
                "<div style='clear:both;'></div>",                
                "Polling stops in <span style='color:#5c5f63;'>{pollSpan}</span> seconds",
                "</div>" 
            ],
            data  : {
                pollSpan        : 300,
                pollInterval    : 10
            },
            cls   : 'lblRd'
        }];
        
        var sLine = Ext.create('Ext.data.Store', {
            fields: [
                { name: 'rx_delta', type: 'int' },
                { name: 'tx_delta', type: 'int' },
                { name: 'drops', type: 'int' },
                { name: 'id', type: 'int' },
                { name: 'timestamp', type: 'string' }
            ],
            data: [
           /*     {
                    "time_unit": "2025-03-03 18:40:09",
                    "rx_delta": 33544,
                    "tx_delta": 48714
                },
                {
                    "time_unit": "2025-03-03 18:40:20",
                    "rx_delta": 3360,
                    "tx_delta": 5611
                },
                {
                    "time_unit": "2025-03-03 18:40:31",
                    "rx_delta": 104902,
                    "tx_delta": 94670
                }  */            
            ]
        });
        
        var crtPackets = Ext.create('Ext.chart.CartesianChart', {
            store: sLine,
            itemId  : 'crtPackets',
            margin  : m,
            padding : p,
            flex    : 1,
            axes: [
                {
                    type        : 'numeric',
                    position    : 'left',
                    adjustByMajorUnit: true,
                    grid        : true,
                    title: {
                        text    : 'Count',
                        fontSize: 15,
                        fill    : Rd.config.rdTextColor
                    },
                    fields      : ['rx_delta', 'tx_delta'],
                    minimum     : 0,
                    label       : Rd.config.rdGraphLabel
                }, 
                {
                    type        : 'category',
                    position    : 'bottom',
                    grid        : false,
                    fields      : ['time_unit'],
                    label       : Rd.config.rdGraphLabel
                }
            ],
            interactions: ['itemhighlight'],
            series: [
                {
                    type    : 'bar',
                    title   : ['Packets'],
                    xField  : 'time_unit',
                    yField  : ['rx_delta', 'tx_delta'],
                    stacked : true,
                    style   : {
                        opacity: 0.80
                    },
                    highlight: {
                        fillStyle: 'yellow'
                    },
                    tooltip: {
                        renderer: function (tooltip, record, item) {
                            var p = record.get("rx_delta");
                            var d = record.get("tx_delta");                         
                            tooltip.setHtml("Rx <b>"+p+"</b><br>Tx <b>"+d+"</b>");                                
                        }
                    }
                }
            ]
        });
        
        me.items =  [
            {
                xtype       : 'panel',
                layout      : {
                    type    : 'hbox',         
                    align   : 'stretch'
                },
                items   : [
                    {
                        xtype       : 'panel',
                        margin      : 5,
                        frame       : false,
                        height      : '100%', 
                        width       :  450,
                        itemId      : 'pnlForLastStats',
                        layout: {
                           type     : 'vbox',
                           align    : 'stretch'
                        },
                        autoScroll  : true,
                        tpl: new Ext.XTemplate(
                            '<div class="container">',                                
                                '<h2>Latest Info</h2>',
                                '<div class="interface sub">',
                                    '<div class="lblContainer">',
                                        '<label class="lblItem">Interface Id</label><label class="lblValue">{mt_id}</label>',
                                    '</div>',
                                    '<div class="lblContainer">',
                                        '<label class="lblItem">Name</label><label class="lblValue">{name}</label>',
                                    '</div>',
                                    '<div class="lblContainer">',
                                        '<label class="lblItem">Type</label><label class="lblValue">{type}</label>',
                                    '</div>',
                                    '<div class="lblContainer">',
                                        '<label class="lblItem">MTU</label><label class="lblValue">{mtu}</label>',
                                    '</div>',
                                    '<div class="lblContainer">',
                                        '<label class="lblItem">Actual MTU</label><label class="lblValue">{actual_mtu}</label>',
                                    '</div>',
                                    '<div class="lblContainer">',
                                        '<label class="lblItem">Link UP</label><label class="lblValue">{last_link_up_time}</label>',
                                    '</div>',
                                    '<div class="lblContainer">',
                                        '<label class="lblItem">Link Downs</label><label class="lblValue">{link_downs}</label>',
                                    '</div>',
                                    '<div class="lblContainer">',
                                        '<label class="lblItem">RX Bytes</label><label class="lblValue">{rx_byte} <i>({[Ext.ux.bytesToHuman(values.rx_byte)]})</i></label>',
                                    '</div>',
                                    '<div class="lblContainer">',
                                        '<label class="lblItem">TX Bytes</label><label class="lblValue">{tx_byte} <i>({[Ext.ux.bytesToHuman(values.tx_byte)]})</i></label>',
                                    '</div>',
                                    '<div class="lblContainer">',
                                        '<label class="lblItem">RX Packets</label><label class="lblValue">{rx_packet}</label>',
                                    '</div>',
                                    '<div class="lblContainer">',
                                        '<label class="lblItem">TX Packets</label><label class="lblValue">{tx_packet}</label>',
                                    '</div>',
                                    '<div class="lblContainer">',
                                        '<label class="lblItem">RX Drops</label><label class="lblValue">{rx_drop}</label>',
                                    '</div>',
                                    '<div class="lblContainer">',
                                        '<label class="lblItem">TX Drops</label><label class="lblValue">{tx_drop}</label>',
                                    '</div>',
                                    '<div class="lblContainer">',
                                        '<label class="lblItem">RX Errors</label><label class="lblValue">{rx_error}</label>',
                                    '</div>',
                                    '<div class="lblContainer">',
                                        '<label class="lblItem">TX Errors</label><label class="lblValue">{tx_error}</label>',
                                    '</div>',
                                '</div>',
                            '</div>'
                        ),
                        data: {
                            ".id": "*F00000",
                            "name": "&lt;pppoe-555@radiusdesk&gt;",
                            "type": "pppoe-in",
                            "mtu": "1480",
                            "actual_mtu": "1480",
                            "last_link_up_time": "mar/02/2025 11:30:44",
                            "link_downs": "0",
                            "rx_byte": "1968989292",   // ~1.96 GB
                            "tx_byte": "15358415653",  // ~15.35 GB
                            "rx_packet": "8400909",
                            "tx_packet": "12837826",
                            "rx_drop": "0",
                            "tx_drop": "0",
                            "tx_queue_drop": "0",
                            "rx_error": "0",
                            "tx_error": "0",
                            "fp_rx_byte": "1967484525",
                            "fp_tx_byte": "0",
                            "fp_rx_packet": "8376086",
                            "fp_tx_packet": "0",
                            "dynamic": "true",
                            "running": "true",
                            "disabled": "false",
                            "mt_id": "*F00000",
                            "permanent_user_id": 149
                        }
                    },
                    crtPackets                   
                ]
            }            
        ];            
        me.callParent(arguments);
    }
});
