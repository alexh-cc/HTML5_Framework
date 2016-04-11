/**
 * @class ParticleBase
 * @constructor
 */
cc.core.game.ParticleBase = function(){
    this.root = null;
    this.texture = null;
    this.life = 3;
    this.poolSize = 150;
    //emitter instance
    this.proton = new Proton();
    this.rad = Math.PI / 180;
    this.deg = 180 / Math.PI;
};

/**
 *
 * @param config
 */
cc.core.game.ParticleBase.prototype.init = function(config){
    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];

    this.emitter = this.createEmitter();
    this.proton.addEmitter(this.emitter);

    this._spritePool = this._createPool(this.poolSize);

    this.renderer = this.createRenderer();

    this.move(config.x, config.y);

    this.renderer.start();
};

/**
 *
 */
cc.core.game.ParticleBase.prototype.dispose = function(){
    if(this.proton) this.proton.destroy();
    this.proton = null;
};

/**
 *
 * @param px
 * @param py
 * @param duration
 */
cc.core.game.ParticleBase.prototype.fire = function(px, py, duration){
    var time = duration || 0.5;
    this.move(px,py);
    this.emit(time);
};

/**
 *
 * @param px
 * @param py
 */
cc.core.game.ParticleBase.prototype.move = function(px,py){
    this.emitter.p.x = px || 0;
    this.emitter.p.y = py || 0;
};

/**
 *
 * @param p_time
 */
cc.core.game.ParticleBase.prototype.update = function(p_time){
    this.proton.update(p_time);
};

/**
 *
 * @param p_secs
 */
cc.core.game.ParticleBase.prototype.emit = function(p_secs){
    var secs = p_secs || Infinity;
    this.emitter.emit(secs);
};

/**
 *
 * @param andRemove
 */
cc.core.game.ParticleBase.prototype.stop = function(andRemove){
    this.emitter.stopEmit();
    if(andRemove){
        this.emitter.removeAllParticles();
    }
};

/**
 * a single emission burst
 */
cc.core.game.ParticleBase.prototype.burst = function(){
    this.emitter.emit(0.2);
};

/**
 *
 * @param radians
 */
cc.core.game.ParticleBase.prototype.rotate = function(radians){
    var degrees = ((radians * this.deg) % 360) - 180;
    this.emitter.velocity.thaPan.a = degrees;
};

/**
 *
 * @returns {Proton.BehaviourEmitter}
 */
cc.core.game.ParticleBase.prototype.createEmitter = function() {
    var texture = this.texture;
    //
    var vx = (this.life * 0.5), vy = this.life;
    var mass = 1, gravity = 2;
    var lx = this.life * 0.35, ly = this.life * 0.5;
    //
    var emitter = new Proton.BehaviourEmitter();
    emitter.addInitialize(new Proton.ImageTarget(texture));
    //* @param {Array or Number or Proton.Span} numpan the number of each emission;
    //* @param {Array or Number or Proton.Span} timepan the time of each emission;
    //emitter.rate = new Proton.Rate(new Proton.Span(15, 30), new Proton.Span(.2, .5));
    //emitter.rate = new Proton.Rate(new Proton.Span(6, 8), new Proton.Span(.05, .1));
    emitter.rate = new Proton.Rate(10, 0.1);
    emitter.addInitialize(new Proton.Mass(mass));
    //
    emitter.addBehaviour(new Proton.Gravity(gravity));
    emitter.addInitialize(new Proton.Life(lx, ly));
    emitter.addInitialize(new Proton.Velocity(new Proton.Span(vx, vy), new Proton.Span(0, 360), 'polar'));
    emitter.addBehaviour(new Proton.Scale(Proton.getSpan(.5, 1.5)));
    emitter.addBehaviour(new Proton.Alpha(1, 0, Infinity, Proton.easeInQuart));
    emitter.addBehaviour(new Proton.Rotate(Proton.getSpan(0, 360), Proton.getSpan(-3, 3), 'add'));
    return emitter;
};

/**
 *
 * @param particleSprite
 * @param particle
 */
cc.core.game.ParticleBase.prototype.transformSprite = function(particleSprite, particle) {
    particleSprite.x = particle.p.x;
    particleSprite.y = particle.p.y;
    particleSprite.scale.x = particle.scale;
    particleSprite.scale.y = particle.scale;
    particleSprite.alpha = particle.alpha;
    particleSprite.rotation = particle.rotation * this.rad;
};

/**
 *
 * @param size
 * @returns {Array}
 * @private
 */
cc.core.game.ParticleBase.prototype._createPool = function(size) {
    var _spritePool = [];
    var sp, tx = this.texture;
    while (size > 0) {
        size--;
        sp = new PIXI.Sprite(tx);
        //TODO - if use pivot then need to factor in resolution!
        sp.anchor.x = 0.5;
        sp.anchor.y = 0.5;
        _spritePool[_spritePool.length] = sp;
    }
    return _spritePool;
};

/**
 *
 */
cc.core.game.ParticleBase.prototype.createRenderer = function() {
    var renderer = new Proton.Renderer('other', this.proton);
    //renderer.onProtonUpdate = function() { };
    var self = this;
    renderer.onParticleCreated = function(particle) {
        particle.sprite = self.nextSprite();
        self.root.addChild(particle.sprite);
    };
    renderer.onParticleUpdate = function(particle) {
        self.transformSprite(particle.sprite, particle);
    };
    renderer.onParticleDead = function(particle) {
        particle.sprite.removeFromParent();
    };
    return renderer;
};

/**
 *
 * @returns {Pixi.Sprite}
 */
cc.core.game.ParticleBase.prototype.nextSprite = function() {
    var sp = this._spritePool.shift();
    this._spritePool[this._spritePool.length] = sp;
    return sp;
};

/**
 *
 * @constructor
 */
cc.core.game.NullParticles = function(){
    //************************************************
    this.dispose = function(){ };
    //
    this.init = function(cfg){ };
    this.fire = function(px,py, duration){ };
    this.move = function(px,py){ };
    //
    this.update = function(p_time){ };
    this.emit = function(p_secs){ };
    //************************************************
};