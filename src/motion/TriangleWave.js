
cc.core.motion.TriangleWave = function(){    
    this._value = 0;
    this._min = 0;
    this._max = 1;
    //oscillate once per second
    this.oscillationsPerSec = 1;
    
};

cc.core.motion.TriangleWave.prototype.update = function(delta){
    var newValue = this._value + (delta * this._step);   
    if(newValue > this._max){
        this._value = this._max; 
        this._step = -this._step;
    } else if(newValue < this._min){
        this._value = this._min; 
        this._step = -this._step;
    } else {
        this._value = newValue; 
    }
    //console.log(this._value);
};

cc.core.motion.TriangleWave.prototype.reset = function(){
    this._value = this._min;
    if(this._step < 0) this._step = -this._step;
};

Object.defineProperty(cc.core.motion.TriangleWave.prototype, 'oscillationsPerSec', {
    set: function(oscillations){
        this._step = oscillations / 500; //half a second as has to go from one side to the other and back for an oscillation  
    }
});

Object.defineProperty(cc.core.motion.TriangleWave.prototype, 'value', {
    get: function(){
        return this._value;   
    }
});