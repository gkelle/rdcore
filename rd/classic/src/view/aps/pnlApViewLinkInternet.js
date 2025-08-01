Ext.define('Rd.view.aps.pnlApViewLinkInternet', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlApViewLinkInternet',
    title       : 'Internet Speed Live',
    bodyPadding : 10,
    html        : '<div id="liveCounter">Waiting for updates...</div>',
    listeners: {
        afterrender: function () {
            const socket = new WebSocket('ws://localhost:8080'); // use actual IP/port in production

            socket.addEventListener('message', function (event) {
                const data = JSON.parse(event.data);
                if (data.type === 'counter') {
                    document.getElementById('liveCounter').innerText = 'Counter: ' + data.value;
                }
            });

            socket.addEventListener('error', function () {
                document.getElementById('liveCounter').innerText = 'WebSocket connection failed';
            });
        }
    }
});

