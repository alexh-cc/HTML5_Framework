
cc.core.motion.SawTooth = function(){    
    this._value = 0;
    this._min = 0;
    this._max = 1;
    //oscillate once per second
    this.oscillationsPerSec = 1;  
    
};

cc.core.motion.SawTooth.prototype.update = function(delta){
    var newValue = this._value + (delta * this._step);   
    if(newValue > this._max){
        newValue -= this._max; 
    } 
    this._value = newValue; 
};

cc.core.motion.SawTooth.prototype.reset = function(){
    this._value = 0;
};

Object.defineProperty(cc.core.motion.SawTooth.prototype, 'oscillationsPerSec', {
    set: function(oscillations){
        this._step = oscillations / 1000;   
    }
});

Object.defineProperty(cc.core.motion.SawTooth.prototype, 'value', {
    get: function(){
        return this._value;   
    }
});
