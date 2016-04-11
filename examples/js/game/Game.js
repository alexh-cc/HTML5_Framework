var Game = function(){

    //game version number - TODO - use package json?
    this.version = "0.0.1";

    this.physics = {};

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

    this.createSpineUtils = function(){
        var spineUtils = new cc.core.utils.SpineUtils();
        spineUtils.init({
            jsonCache: this.json
        });
        return spineUtils;
    };


    /**
     *
     */
    this.start = function(){
        //create spine utils
        this.spineUtils = this.createSpineUtils();

        //configure the screen manager
        this.game.gameScreens.call(game_shell.screenMgr);
        //start asset loading, use a BulkLoader class
        this.screenMgr.showScreen(cc.core.settings.FIRST_SCREEN);
    }
};
//
Game.call(game_shell);

