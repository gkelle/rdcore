Ext.define('Rd.view.radstats.pnlRadstats', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlRadstats',
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    requires    : [
        'Rd.view.radstats.vcRadstats',
        'Rd.view.radstats.cmbRadstatsServers',
    ],
    controller  : 'vcRadstats',
    initComponent: function(){
    
        var me 	    = this;
        var scale   = 'small';
        var dd      = Ext.getApplication().getDashboardData();
        var m       = 5;
        var p       = 5;
        
        Ext.create('Ext.data.Store', {
            storeId : 'distroStore',
            fields  :[ 
                {name: 'id',        type: 'int'},
                { name: 'objtype',  type: 'string' },
                { name: 'requests', convert: v => v == null ? 0 : parseFloat(v) }, 
                { name: 'responsetime', convert: v => v == null ? 0 : parseFloat(v) }             
            ]
        });
        
        Ext.create('Ext.data.Store', {
            storeId : 'loadStore',
            fields  :[ 
                {name: 'id',         type: 'int'},
                {name: 'hostname',   type: 'string'},
                {name: 'requests',   type: 'int'},
                { name: 'responsetime', convert: v => v == null ? 0 : parseFloat(v) } 
            ]
        });
        
        me.timezone_id = dd.user.timezone_id;
        
        // Model-less store; convert string -> number, keep nulls as null
        function intOrNull(v){ return (v===null || v===undefined || v==='') ? null : parseInt(v,10); }
        function floatOrNull(v){ return (v===null || v===undefined || v==='') ? null : parseFloat(v); }
        
        var store = Ext.create('Ext.data.Store', {
            fields: [
                { name: 'time_unit', type: 'string' },
                { name: 'requests_acct', convert: intOrNull },
                { name: 'requests_coa',  convert: intOrNull },
                { name: 'requests_auth', convert: intOrNull },
                { name: 'avg_rtt_acct',  convert: floatOrNull },
                { name: 'avg_rtt_coa',   convert: floatOrNull },
                { name: 'avg_rtt_auth',  convert: floatOrNull },
                { name: 'id', type: 'int' }
            ],
            data: []         
        });
        
        var chart = {
            xtype   : 'panel',
            itemId  : 'pnlRequests',
            width: '100%',
            layout: 'fit',
            items: [{
                xtype: 'cartesian',
                reference: 'radRequestsChart',
                itemId  : 'barTotals',
                store: store,
                insetPadding: 20,
                animation: true,
                legend: { docked: 'bottom' },
                interactions: ['itemhighlight'],
                axes: [{
                    type: 'category',
                    position: 'bottom',
                    fields: ['time_unit'],
                    label: {
                        textAlign: 'right',
                        rotate: { degrees: -45 }  // your "Wed\nHH:00" labels wrap nicely
                    },
                    grid: true
                }, {
                    type: 'numeric',
                    position: 'left',
                    grid: true,
                    minimum: 0
                }],
                series: [{
                    type: 'bar',
                    xField: 'time_unit',
                    yField: ['requests_auth','requests_acct', 'requests_coa' ],
                    title: ['Auth','Acct', 'CoA'],
                    stacked: false,        // grouped bars; set true for stacked
                    highlight: true,
                    style: { minGapWidth: 12 },
                    tooltip: {
                        trackMouse: true,
                        renderer: function (tooltip, record, item) {
                            var labelMap = {
                                requests_acct: 'Acct',
                                requests_coa:  'CoA',
                                requests_auth: 'Auth'
                            };
                            var yField = item.field; // the specific series field for this bar
                            var val = record.get(yField);
                            tooltip.setHtml(
                                Ext.String.format(
                                    '<div><b>{0}</b> @ {1}: {2}</div>',
                                    labelMap[yField] || yField,
                                    (record.get('time_unit') || '').replace('\n', ' '),
                                    Ext.util.Format.number(val, '0,000')
                                )
                            );
                        }
                    }
                }]
            }]
        }
        
        var chart_response = {
            xtype   : 'panel',
            itemId  : 'pnlResponse',
            width   : '100%',
            layout  : 'fit',
            hidden  : true,
            items: [{
                xtype: 'cartesian',
                reference: 'radResponseChart',
                itemId  : 'barTotals',
                store: store,
                insetPadding: 20,
                animation: true,
                legend: { docked: 'bottom' },
                interactions: ['itemhighlight'],
                axes: [{
                    type: 'category',
                    position: 'bottom',
                    fields: ['time_unit'],
                    label: {
                        textAlign: 'right',
                        rotate: { degrees: -45 }  // your "Wed\nHH:00" labels wrap nicely
                    },
                    grid: true
                }, {
                    type: 'numeric',
                    position: 'left',
                    grid: true,
                    minimum: 0
                }],
                series: [{
                    type: 'bar',
                    xField: 'time_unit',
                    yField: ['avg_rtt_auth','avg_rtt_acct', 'avg_rtt_coa' ],                   
                    title: ['Auth','Acct', 'CoA'],
                    stacked: false,        // grouped bars; set true for stacked
                    highlight: true,
                    style: { minGapWidth: 12 },
                    tooltip: {
                        trackMouse: true,
                        renderer: function (tooltip, record, item) {
                            var labelMap = {
                                avg_rtt_acct : 'Acct',
                                avg_rtt_coa  : 'CoA',
                                avg_rtt_auth : 'Auth'
                            };

                            var yField = item.field; // e.g. 'avg_rtt_auth'
                            var rawVal = record.data[yField]; // safe way to fetch the actual value

                            tooltip.setHtml(
                                Ext.String.format(
                                    '<div><b>{0}</b> @ {1}: {2}</div>',
                                    labelMap[yField] || yField,
                                    (record.get('time_unit') || '').replace('\n', ' '),
                                    Ext.util.Format.number(rawVal, '0.00000') // 5 decimals
                                )
                            );
                        }
                    }
                }]
            }]
        }
                    
        me.dockedItems= [
            {
                xtype   : 'toolbar',
                dock    : 'top',
                items   : [
                    {  
                        glyph   : Rd.config.icnReload,    
                        scale   : scale, 
                        itemId  : 'reload',
                        ui      : 'button-orange',   
                        tooltip: i18n('sReload')
                    },
                    {
                        xtype       : 'cmbRadstatsServers',
                        allOption   : true,
                        width       : 200,
                        itemId      : 'cmbRadstatsServers',
                        value       : 0 
                    },
                    '|',
                    { 
                        scale       : scale, 
                        glyph       : Rd.config.icnLeft,
                        reference   : 'btnTimeBack',
                        tooltip     : 'Go Back 1Day',
                        listeners   : {
                            click: 'onClickTimeBack'
                        }
                    },  
                    {
                        xtype       : 'datefield',
                        itemId      : 'dtDate',
                        reference   : 'dtDate',
                        name        : 'date',
                        format      : "d/m/Y",
                        value       : new Date(),
                        width       : 120
                    },
                    { 
                        scale       : scale, 
                        glyph       : Rd.config.icnRight,
                        reference   : 'btnTimeForward',
                        tooltip     : 'Go Forward 1Day',
                        disabled    : true,
                        listeners   : {
                            click: 'onClickTimeForward'
                        }
                    }, 
                    '|',
                    {
                        text        : 'Day',
                        glyph       : Rd.config.icnHourStart,
                        scale       : scale,
                        enableToggle: true,
                        toggleGroup : 'range',
                        allowDepress: false,
                        value       : 'day',
                        pressed     : true,
                        listeners   : {
                            click: 'onClickTodayButton'
                        }
                    }, 
                    {
                        text        : 'Week',
                        glyph       : Rd.config.icnHourHalf,
                        scale       : scale,
                        enableToggle: true,
                        toggleGroup: 'range',
                        allowDepress: false,
                        value       : 'week',
                        listeners   : {
                           click: 'onClickThisWeekButton'
                        }
                   }, 
                   {
                        text        : 'Month',
                        glyph       : Rd.config.icnHourEnd,
                        scale       : scale,
                        enableToggle: true,
                        toggleGroup: 'range',
                        allowDepress: false,
                        value       : 'month',
                        listeners   : {
                            click: 'onClickThisMonthButton'
                        }
                   },                  
                   { 
                        scale       : scale, 
                        glyph       : Rd.config.icnTime,
                        tooltip     : 'Timezone',
                        ui          : 'button-metal',   
                        menu        : [
                        {
                            xtype         : 'cmbTimezones', 
                            width         : 300, 
                            itemId        : 'cmbTimezone',
                            name          : 'timezone_id', 
                            labelClsExtra : 'lblRdReq',
                            labelWidth    : 100, 
                            padding       : 10,
                            margin        : 10,
                            value         : me.timezone_id,
                            listeners     : {
                                change  : function(cmb){
                                    var btn = cmb.up('button');
                                    btn.getMenu().hide();
                                    console.log(cmb.getValue());
                                }
                            }
                        }]
                    },
                    '|',
                    {
                        text        : 'RADIUS Requests',
                        glyph       : Rd.config.icnRadiusClient,
                        scale       : scale,
                        enableToggle: true,
                        toggleGroup : 'req_resp',
                        allowDepress: false,
                        value       : 'day',
                        pressed     : true,
                        listeners   : {
                            click: 'onClickRequestsButton'
                        }
                    }, 
                    {
                        text        : 'Response Time',
                        glyph       : Rd.config.icnActivity,
                        scale       : scale,
                        enableToggle: true,
                        toggleGroup: 'req_resp',
                        allowDepress: false,
                        value       : 'week',
                        listeners   : {
                           click: 'onClickResponseButton'
                        }
                   }, 
                ]
            }
        ];
        me.items = [
            {
                xtype   : 'panel',
                flex    : 1,
                border  : false,
                layout: {
                    type    : 'hbox',
                    align   : 'stretch'
                },
                items : [
                    {
                        xtype   : 'panel',
                        title   : 'Summary',
                        ui      : 'panel-blue',
                        border  : true,
                        margin  : m,
                        padding : p,
                        flex    : 1,
                        layout  : 'fit',
                        itemId  : 'pnlSummary', // keep if you already use it
                        // reference: 'dailyTotal', // uncomment if you prefer lookupReference()
                        bodyPadding: 8,
                        tpl: new Ext.XTemplate(
                            '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;text-align:center;">',
                                '<div style="padding:12px;border-radius:12px;background:rgba(0,0,0,0.03);">',
                                    '<div style="font-size:12px;text-transform:uppercase;opacity:.7;">Date<br><br></div>',
                                    '<div style="font-size:22px;font-weight:700;">{[this.fmtDate(values.date || values.start)]}</div>',
                                '</div>',
                                '<div style="padding:12px;border-radius:12px;background:rgba(0,0,0,0.03);">',
                                    '<div style="font-size:12px;text-transform:uppercase;opacity:.7;">Timespan<br><br></div>',
                                   // '<div style="font-size:22px;font-weight:700;">{[this.fmtSpan(values)]}</div>',
                                     '<div style="font-size:22px;font-weight:700;">{[this.frmtSpanSimple(values)]}</div>',
                                '</div>',
                                '<div style="padding:12px;border-radius:12px;background:rgba(0,0,0,0.03);">',
                                    '<div style="font-size:12px;text-transform:uppercase;opacity:.7;">Requests<br><br></div>',
                                    '<div style="font-size:28px;font-weight:800;letter-spacing:.3px;">{[this.fmtNum(values.requests)]}</div>',
                                '</div>',
                                '<div style="padding:12px;border-radius:12px;background:rgba(0,0,0,0.03);">',
                                    '<div style="font-size:12px;text-transform:uppercase;opacity:.7;">Response time (avg seconds)<br><br></div>',
                                    '<div style="font-size:28px;font-weight:800;">{[this.fmtMs(values.avg_rtt || values.responsetime)]}</div>',
                                '</div>',
                            '</div>',
                            {
                                fmtDate: function (d) {
                                    // accepts Date or ISO string
                                    if (!d) return '—';
                                    var dt = Ext.isDate(d) ? d : new Date(d);
                                    return Ext.Date.format(dt, 'D, j M Y');
                                },
                                fmtNum: function (n) {
                                    n = parseFloat(n || 0);
                                    return Ext.util.Format.number(n, '0,0');
                                },
                                fmtMs: function (sec) {
                                    var s = parseFloat(sec || 0);
                                    return Ext.util.Format.number(s, '0.00000'); // 5 decimals
                                },
                                frmtSpanSimple: function (v) {
                                     if (v.timespan) return v.timespan;
                                     if (!v.timespan) return '—';
                                },
                                fmtSpan: function (v) {
                                    // Prefer explicit text if provided
                                    if (v.timespan) return v.timespan;

                                    // Otherwise build from start/end
                                    var start = v.start ? (Ext.isDate(v.start) ? v.start : new Date(v.start)) : null;
                                    var end   = v.end   ? (Ext.isDate(v.end)   ? v.end   : new Date(v.end))   : null;
                                    if (!start || !end) return '—';

                                    var diffMs = Math.max(0, end - start),
                                        mins   = Math.round(diffMs / 60000),
                                        days   = Math.floor(mins / 1440),
                                        hours  = Math.floor((mins % 1440) / 60),
                                        mrem   = mins % 60;

                                    var range = Ext.Date.format(start, 'D H:i') + ' – ' + Ext.Date.format(end, 'D H:i');
                                    var human = [];
                                    if (days)  human.push(days + 'd');
                                    if (hours) human.push(hours + 'h');
                                    if (mrem)  human.push(mrem + 'm');
                                    if (!human.length) human.push('0m');
                                    return range + ' (' + human.join(' ') + ')';
                                }
                            }
                        ),
                        data: {
                            // Example structure; update dynamically (see below)
                             //date: '2025-08-20',
                             //start: '2025-08-20 00:00:00',
                             //end:   '2025-09-20 14:59:59',
                             //requests: 186432,
                             //avg_rtt: 0.00631 // seconds
                        }
                    },                  
                    {
                        flex            : 1,
                        title           : 'Auth/Acct/POC - Requests Ratio',
                        ui              : 'panel-blue',
                        border          : true,
                        margin          : m,
                        padding         : p,
                        itemId          : 'plrAcctAuth',
                        xtype           : 'polar',
                        innerPadding    : 10,
                        interactions    : ['rotate', 'itemhighlight'],
                        store: Ext.data.StoreManager.lookup('distroStore'),
                        series: {
                            type       : 'pie',
                            angleField : 'requests',
                            donut      : 10,
                            highlight  : true,
                            showInLegend: true,           // use legend with the slice names
                            label: {
                                field   : 'objtype',      // use your objtype for names
                                display : 'outside',
                                calloutLine: { length: 30, width: 1 },
                                renderer: function (text, sprite, config, rendererData, index) {
                                    var store = rendererData.store,
                                        rec   = store.getAt(index),
                                        val   = parseFloat(rec.get('requests')) || 0,
                                        total = 0;

                                    store.each(function(r){
                                        total += parseFloat(r.get('requests')) || 0;
                                    });

                                    var pct = total ? (val / total) * 100 : 0;
                                    return Ext.String.format(
                                        '{0}: {1} ({2}%)',
                                        rec.get('objtype'),
                                        Ext.util.Format.number(val, '0,000'),
                                        Ext.util.Format.number(pct, '0')
                                    ); // e.g. "Auth: 14,267 (33%)"
                                }
                            },
                            tooltip : {
                                trackMouse: true,
                                renderer: function (tooltip, record) {
                                    var val = parseFloat(record.get('requests')) || 0;
                                    tooltip.setHtml(
                                        '<div><b>' + record.get('objtype') + '</b><br/>' +
                                        Ext.util.Format.number(val, '0,000') + ' requests</div>'
                                    );
                                }
                            }
                        },
                        data    : {
                        }
                    }, 
                     {
                        flex            : 1,
                        title           : 'Auth/Acct/POC - Slowest Response Times',
                        ui              : 'panel-blue',
                        border          : true,
                        margin          : m,
                        padding         : p,
                        itemId          : 'plrAcctAuthSlowest',
                        hidden          : true,
                        xtype           : 'polar',
                        innerPadding    : 10,
                        interactions    : ['rotate', 'itemhighlight'],
                        store: Ext.data.StoreManager.lookup('distroStore'),
                        series: {
                            type       : 'pie',
                            angleField : 'responsetime',
                            donut      : 10,
                            highlight  : true,
                            showInLegend: true,           // use legend with the slice names
                            label: {
                                field   : 'objtype',      // use your objtype for names
                                display : 'outside',
                                calloutLine: { length: 30, width: 1 },
                                renderer: function (text, sprite, config, rendererData, index) {
                                    var store = rendererData.store,
                                        rec   = store.getAt(index),
                                        val   = parseFloat(rec.get('responsetime')) || 0,
                                        total = 0;

                                    store.each(function(r){
                                        total += parseFloat(r.get('responsetime')) || 0;
                                    });

                                    var pct = total ? (val / total) * 100 : 0;
                                    return Ext.String.format(
                                        '{0}: {1} ({2}%)',
                                        rec.get('objtype'),
                                        Ext.util.Format.number(val, '0.00000'),
                                        Ext.util.Format.number(pct, '0')
                                    ); // e.g. "Auth: 14,267 (33%)"
                                }
                            },
                            tooltip : {
                                trackMouse: true,
                                renderer: function (tooltip, record) {
                                    var val = parseFloat(record.get('responsetime')) || 0;
                                    tooltip.setHtml(
                                        '<div><b>' + record.get('objtype') + '</b><br/>' +
                                        Ext.util.Format.number(val, '0.00000') + ' ms</div>'
                                    );
                                }
                            }
                        },
                        data    : {
                        }
                    },                 
                    {
                        flex            : 1,
                        title           : 'Servers - Requests Balance',
                        ui              : 'panel-blue',
                        border          : true,
                        margin          : m,
                        padding         : p,
                        itemId          : 'plrSrvBalance',
                        xtype           : 'polar',
                        store           : Ext.data.StoreManager.lookup('loadStore'),
                        innerPadding    : 10,
                        interactions    : ['rotate', 'itemhighlight'],
                        legend          : {
                            docked: 'right'   // or 'bottom'
                        },
                        series  : {
                            type        : 'pie',
                            angleField  : 'requests',
                            donut       : 10,
                            highlight   : true,
                            showInLegend: true,         // show slices in legend
                            label       : {
                                field   : 'hostname',      // slice names
                                display : 'outside',
                                calloutLine: { length: 30, width: 1 },
                                renderer: function (text, sprite, config, rendererData, index) {
                                    var store = rendererData.store,
                                        rec   = store.getAt(index),
                                        val   = parseFloat(rec.get('requests')) || 0,
                                        total = 0;

                                    store.each(function (r) {
                                        total += parseFloat(r.get('requests')) || 0;
                                    });

                                    var pct = total ? (val / total) * 100 : 0;

                                    return Ext.String.format(
                                        '{0}: {1} ({2}%)',
                                        rec.get('hostname'),
                                        Ext.util.Format.number(val, '0,000'),
                                        Ext.util.Format.number(pct, '0')
                                    );
                                }
                            },
                            tooltip: {
                                trackMouse: true,
                                renderer: function (tooltip, record) {
                                    var val = parseFloat(record.get('requests')) || 0;
                                    var total = 0;
                                    record.store.each(function (r) {
                                        total += parseFloat(r.get('requests')) || 0;
                                    });
                                    var pct = total ? (val / total) * 100 : 0;

                                    tooltip.setHtml(
                                        '<b>' + Ext.htmlEncode(record.get('hostname')) + '</b><br>' +
                                        Ext.util.Format.number(val, '0,000') + ' requests' +
                                        ' (' + Ext.util.Format.number(pct, '0') + '%)'
                                    );
                                }
                            }
                        }
                    },
                    {
                        flex            : 1,
                        title           : 'Servers - Slowest Response Times',
                        ui              : 'panel-blue',
                        border          : true,
                        margin          : m,
                        padding         : p,
                        hidden          : true,
                        itemId          : 'plrSrvSlowest',
                        xtype           : 'polar',
                        store           : Ext.data.StoreManager.lookup('loadStore'),
                        innerPadding    : 10,
                        interactions    : ['rotate', 'itemhighlight'],
                        legend          : {
                            docked: 'right'   // or 'bottom'
                        },
                        series  : {
                            type        : 'pie',
                            angleField  : 'responsetime',
                            donut       : 10,
                            highlight   : true,
                            showInLegend: true,         // show slices in legend
                            label       : {
                                field   : 'hostname',      // slice names
                                display : 'outside',
                                calloutLine: { length: 30, width: 1 },
                                renderer: function (text, sprite, config, rendererData, index) {
                                    var store = rendererData.store,
                                        rec   = store.getAt(index),
                                        val   = parseFloat(rec.get('responsetime')) || 0,
                                        total = 0;

                                    store.each(function (r) {
                                        total += parseFloat(r.get('responsetime')) || 0;
                                    });

                                    var pct = total ? (val / total) * 100 : 0;

                                    return Ext.String.format(
                                        '{0}: {1} ({2}%)',
                                        rec.get('hostname'),
                                        Ext.util.Format.number(val, '0.00000'),
                                        Ext.util.Format.number(pct, '0')
                                    );
                                }
                            },
                            tooltip: {
                                trackMouse: true,
                                renderer: function (tooltip, record) {
                                    var val = parseFloat(record.get('responsetime')) || 0;
                                    var total = 0;
                                    record.store.each(function (r) {
                                        total += parseFloat(r.get('responsetime')) || 0;
                                    });
                                    var pct = total ? (val / total) * 100 : 0;

                                    tooltip.setHtml(
                                        '<b>' + Ext.htmlEncode(record.get('hostname')) + '</b><br>' +
                                        Ext.util.Format.number(val, '0.00000') + ' ms' +
                                        ' (' + Ext.util.Format.number(pct, '0') + '%)'
                                    );
                                }
                            }
                        }
                    }               
                ]
            },
            {
                xtype   : 'panel',
                flex    : 1,
                border  : false,
                layout: {
                    type    : 'hbox',
                    align   : 'stretch'
                },
                items   : [
                    chart,
                    chart_response
                ]
            }
        ];
        
                                    
        me.callParent(arguments);
    }
});
