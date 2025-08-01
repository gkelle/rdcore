Ext.define('Rd.controller.cRouter', {

    extend: 'Ext.app.Controller',  
    config: {
        currentScreen   : null,
        processingRoute : false
    },
    
    routes: {
        ':screen': {
            action: 'handleRoute',
            before: 'beforeRoute'
        }
    },
    
    init: function() {
        this.listen({
            controller: {
                '*': {
                    changescreen: this.onScreenChangeRequest
                }
            }
        });
    },
    
    beforeRoute: function(screen, action) {
    
        console.log("Before Route "+screen);
        if (this.getProcessingRoute() || screen === this.getCurrentScreen()) {
            action.stop();
            return false;
        }
        
        this.setProcessingRoute(true);
        action.resume();
    },
    
    handleRoute: function(screen) {
        if (!this.validateScreen(screen)) {
            this.redirectTo(this.getCurrentScreen() || 'home');
            return;
        }
        
        this.setCurrentScreen(screen);
        this.updateViews(screen);
        this.setProcessingRoute(false);
    },
    
    onScreenChangeRequest: function(screen) {
        if (screen !== this.getCurrentScreen()) {
            this.setCurrentScreen(screen);
            this.updateViews(screen);
            this.redirectTo(screen);
        }
    },
    
    validateScreen: function(screen) {
        // Implement your screen validation logic
        return ['home', 'products', 'contact'].includes(screen);
    },
    
    updateViews: function(screen) {
        // Your view update logic here
    }
});
