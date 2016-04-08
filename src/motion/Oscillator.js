/**
 * Created with IntelliJ IDEA.
 * User: alex
 * Date: 2014/06/17
 * Time: 2:56 PM
 * To change this template use File | Settings | File Templates.
 */
alex.motion.Oscillator = function(){
    this.speedX = 0.0005;
    this.speedY = 0.0005;
    this.time = 0;
    this.x = 0;
    this.y = 0; 
};

alex.motion.Oscillator.prototype.init = function(config){
    if(config.speedX) this.speedX = config.speedX;
    if(config.speedY) this.speedY = config.speedY;
    if(config.time) this.time = config.time;
    if(config.x) this.x = config.x;
    if(config.y) this.y = config.y;
};

alex.motion.Oscillator.prototype.randomise = function(){
    this.speedX = 0.0005 + (Math.random() * 0.001);
    this.speedY = 0.0005 + (Math.random() * 0.001);
};
//
alex.motion.Oscillator.prototype.reset = function(){
    this.time = 0;
    this.x = 0;
    this.y = 0; 
};

alex.motion.Oscillator.prototype.update = function(p_delta){
    this.time += p_delta;
    this.x = Math.cos(this.time * this.speedX);
    this.y = Math.sin(this.time * this.speedY);
};

