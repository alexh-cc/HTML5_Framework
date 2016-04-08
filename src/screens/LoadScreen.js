/**
 * default load screen!
 * @param config
 * @constructor
 */
alex.screens.LoadScreen = function(config){
	alex.screens.ScreenBase.call(this, config);
};
alex.screens.LoadScreen.prototype = Object.create(alex.screens.ScreenBase.prototype);
alex.screens.LoadScreen.prototype.constructor = alex.screens.LoadScreen;

/**
 *
 */
alex.screens.LoadScreen.prototype.run  = function(){
    this.loadBar = this.createBar();

    //NOTE - loader events are automatically removed on complete
    var self = this;
    game_shell.loader.on("progress", function(event){
        self.loadBar.progress(event.value);
    });
    game_shell.loader.on("complete", function(){
        self.loadBar.progress(1);
        self.fadeOut.call(self);
    });

};

/**
 *
 */
alex.screens.LoadScreen.prototype.fadeOut = function(){
    var self = this;
    new TWEEN.Tween(this.loadBar)
            .to({alpha: 0}, 500)
            .onComplete(function(){
                self.newScreen(self.targetScreen);
            })
            .start();
};

/**
 *
 * @returns {alex.ui.LoadBar}
 */
alex.screens.LoadScreen.prototype.createBar = function(){
    var w = 200, h = 30;
    var loadBar = new alex.ui.LoadBar(w, h, 0x000000, 0xffffff);
    loadBar.pivot.x = w * 0.5; loadBar.pivot.y = h * 0.5;
    this.addChild(loadBar);
    return loadBar;
};