/**
 *
 *
 */
game_shell.Keys = {
	_pressed: {},
    //
	LEFT_KEY: 37,
    ENTER_KEY: 13,
	UP_KEY: 38,
	RIGHT_KEY: 39,
	DOWN_KEY: 40,
	SPACE_KEY: 32,
	SHIFT_KEY: 16,
	//key states
	UP:0,
	JUST_PRESSED:1,
	DOWN:2,
	onKeydown: function(event) {
		if(!this._pressed[event.keyCode]) this._pressed[event.keyCode] = this.JUST_PRESSED;
        var evt = event || window.event;
        if (evt.stopPropagation !== undefined) {
            evt.stopPropagation();
        } else {
            evt.cancelBubble = true;
        }
        if(evt.preventDefault) evt.preventDefault();
	},
	onKeyup: function(event) {
		delete this._pressed[event.keyCode];
        var evt = event || window.event;
        if (evt.stopPropagation !== undefined) {
            evt.stopPropagation();
        } else {
            evt.cancelBubble = true;
        }
        if(evt.preventDefault) evt.preventDefault();
    },
    update:function(dt){
    	for(var s in this._pressed){
            if(this._pressed.hasOwnProperty(s)){
    		  if(this._pressed[s] === this.JUST_PRESSED) this._pressed[s] = this.DOWN;
            }
    	}
    },
    clear:function(){
        for(var s in this._pressed){
            if(this._pressed.hasOwnProperty(s)){
                delete this._pressed[s];
            }
        }
    },
    enable: function(bool){
        if(!this.boundKeyUp) this.boundKeyUp = this.onKeyup.bind(this);
        if(!this.boundKeyDown) this.boundKeyDown = this.onKeydown.bind(this);
        //support iframes!
        var isIframe = window.parent !== window;
        var w = (isIframe)? document : window;//parent || window;
		w.removeEventListener('keyup', this.boundKeyUp);
		w.removeEventListener('keydown', this.boundKeyDown);
    	if(bool){
    		w.addEventListener('keyup', this.boundKeyUp, false);
			w.addEventListener('keydown', this.boundKeyDown, false);
            //console.log("isIframe: " + isIframe)
            if(isIframe){
                window.focus();
            }
    	} else {
            this.clear();
        }
    },
    isDown: function(keyCode) {
        return this._pressed[keyCode] > 0;
    },
    wasPressed: function(keyCode) {
        return this._pressed[keyCode] === this.JUST_PRESSED;
    },
    keyState: function(code){
        return this._pressed[code] || this.UP;
    }
};

/**
 * 
 * @constructor
 */
game_shell.KeyListener = function(){};
game_shell.KeyListener.prototype = Object.create(game_shell.Keys);
game_shell.KeyListener.prototype.constructor = game_shell.KeyListener;
//
