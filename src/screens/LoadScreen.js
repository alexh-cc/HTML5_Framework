/**
 * default load screen!
 * @param config
 * @constructor
 */
cc.core.screens.LoadScreen = function(config){
	cc.core.screens.ScreenBase.call(this, config);
};
cc.core.screens.LoadScreen.prototype = Object.create(cc.core.screens.ScreenBase.prototype);
cc.core.screens.LoadScreen.prototype.constructor = cc.core.screens.LoadScreen;

/**
 *
 */
cc.core.screens.LoadScreen.prototype.run  = function(){
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
cc.core.screens.LoadScreen.prototype.fadeOut = function(){
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
 * @returns {cc.core.ui.LoadBar}
 */
cc.core.screens.LoadScreen.prototype.createBar = function(){
    var w = 200, h = 30;
    var loadBar = new cc.core.ui.LoadBar(w, h, 0x000000, 0xffffff);
    loadBar.pivot.x = w * 0.5; loadBar.pivot.y = h * 0.5;
    this.addChild(loadBar);
    return loadBar;
};