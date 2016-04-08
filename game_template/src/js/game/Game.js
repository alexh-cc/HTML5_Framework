(function(){

    //game version number - TODO - use package json?
    this.version = "0.0.1";

    //namespaces
    this.title = {};
    this.menu = {};
    this.game = {};


    /**
     *
     */
    this.onReady = function(){
        // - bootstrap loader for preloader assets
        this.bootstrap();
    };

    /**
     *
     */
    this.bootstrap = function () {
        //preload the loading bar!
        this.preload = new game_shell.BootStrap();
        this.preload.init({
            resolution: this.resolution,
            stageW: this.viewport.width,
            stageH: this.viewport.height,
            stage: this.stage.content//stage
        });
        var self = this;
        this.preload.on('complete', function(){
            self.preloadComplete();
        });
        this.preload.start();
    };

    /**
     *
     */
    this.preloadComplete = function(){
        //set up stuff
        this.start();
    };

    /**
     *
     */
    this.start = function(){
        //configure the screen manager
        this.game.gameScreens.call(game_shell.screenMgr);
        //start asset loading, use a BulkLoader class
        this.screenMgr.showScreen(alex.settings.FIRST_SCREEN);
    }
}).call(game_shell);

