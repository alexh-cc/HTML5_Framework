//
alex.ui.PopupBase = function(){
	this.quadAlpha = 0.5;
	this.fadeTime = 250;
	this.tweenTime = 750;
	this.minScale = 0.001;
    //
    this.eventOpen = {type: 'open'};
    this.eventShut = {type: 'shut'};
    this.states = {HIDDEN:0, OPENING: 1, SHOWN: 2, CLOSING: 3};
    this.state = this.states.HIDDEN;
    // TODO this stuff could happen on init...
    this.root = new PIXI.Container();
	this.bgQuad = this.createQuad();
	this.content = this.createContentHolder();
    //
    this.tweenOpen = this.createTweenOpen();
    this.tweenShut = this.createTweenShut();
    this.tweenQuadIn = this.createTweenQuadIn();
    this.tweenQuadOut = this.createTweenQuadOut();

};
//*******************************
alex.ui.PopupBase.prototype = Object.create(alex.utils.EventDispatcher.prototype);
alex.ui.PopupBase.prototype.constructor = alex.ui.PopupBase;
//*******************************************************
// CREATE STUFF
//*******************************************************

alex.ui.PopupBase.prototype.createQuad = function(){
	var w = alex.settings.DEFAULT_W + 2,
        h = alex.settings.DEFAULT_H;
	var bgQuad = new alex.display.Quad(w, h, 0x000000);
	bgQuad.alpha = 0;
    bgQuad.x = w * -0.5; bgQuad.y = h * -0.5;
	this.root.addChild(bgQuad);
	return bgQuad;
};

alex.ui.PopupBase.prototype.createContentHolder = function(){
	var content = new PIXI.Container();
	this.root.addChild(content);
	return content;
};

//*******************************************************
// SHOW
//*******************************************************

alex.ui.PopupBase.prototype.show = function(){
	if(this.state === this.states.HIDDEN){
        this.state = this.states.OPENING;
        this.bgQuad.alpha = 0;
        this.content.scale.x = this.minScale;
        this.content.scale.y = this.minScale;
        //
        this.tweenQuadIn.start();
        this.tweenOpen.start();  
    }   
};

alex.ui.PopupBase.prototype.createTweenQuadIn = function(){
    return new TWEEN.Tween(this.bgQuad).to({alpha:this.quadAlpha}, this.fadeTime);
};

alex.ui.PopupBase.prototype.createTweenQuadOut = function(){
    return new TWEEN.Tween(this.bgQuad).to({alpha: 0}, this.fadeTime);
};

alex.ui.PopupBase.prototype.createTweenOpen = function(){
    var self = this;
    return new TWEEN.Tween(this.content.scale)
                .to({x: 1, y: 1}, this.tweenTime)
                .easing(TWEEN.Easing.Back.Out)
                .onComplete(function(){
                    self.state = self.states.SHOWN;
                    self.onShown();
                });
};

alex.ui.PopupBase.prototype.onShown = function(){
	//override this
    this.emit(this.eventOpen);
};

//*******************************************************
// HIDE
//*******************************************************

alex.ui.PopupBase.prototype.hide = function(){
    if(this.state !== this.states.CLOSING){
        this.state = this.states.CLOSING;
        this.tweenQuadOut.start();
        this.tweenShut.start();    
    }   
};

alex.ui.PopupBase.prototype.createTweenShut = function(){
    var self = this;
    return new TWEEN.Tween(this.content.scale)
                .to({x: this.minScale, y: this.minScale}, this.tweenTime)
                .easing(TWEEN.Easing.Back.In)
                .onComplete(function(){
                    self.state = self.states.HIDDEN;
                    self.onHidden();
                });
};

alex.ui.PopupBase.prototype.onHidden = function(){
	this.emit(this.eventShut);
};

//make isShown into a getter
Object.defineProperty(alex.ui.PopupBase.prototype, "isShown", {
    get:function(){
        var isShownVar = this.state === this.states.SHOWN;
        var isOpening = this.state === this.states.OPENING;
        return isShownVar || isOpening;
    }
});
