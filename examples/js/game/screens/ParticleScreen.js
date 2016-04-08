game_shell.screens.ParticleScreen = function (config) {
    game_shell.screens.ExampleScreen.call(this, config)
};
game_shell.screens.ParticleScreen.prototype = Object.create(game_shell.screens.ExampleScreen.prototype);
game_shell.screens.ParticleScreen.prototype.constructor = game_shell.screens.ParticleScreen;

/**
 *
 */
game_shell.screens.ParticleScreen.prototype.run = function () {
    console.log('ParticleScreen');

    //add a background to catch touches!
    this.background = this.createBackground();

    this.particles = this.createParticles();

    this.createBackButton();

    this.particles.move(0, 0);
    this.particles.emit();

    this.enableDrag();

};

/**
 *
 */
game_shell.screens.ParticleScreen.prototype.createBackground = function(){
    var q = new alex.display.Quad(this.screenW, this.screenH, 0x0);
    q.x = this.screenW * -0.5;
    q.y = this.screenH * -0.5;
    this.addChild(q);
    return q;
};

/**
 *
 */
game_shell.screens.ParticleScreen.prototype.enableDrag = function(){
    // - follow mouse!
    var self = this;
    var pt = new PIXI.Point();
    self.interactive = true;
    self.hitArea = new PIXI.Rectangle(
        this.screenW * -0.5,
        this.screenH * -0.5,
        this.screenW,
        this.screenH
    )

    // * mousemove *
    self.touchmove = (function(event){
        var iData = event.data;
            iData.getLocalPosition(self, pt);
            self.particles.move(pt.x, pt.y);
    }).bind(this);
    self.on('mousemove', this.touchmove);
    self.on('touchmove', this.touchmove);
}




/**
 *
 */
game_shell.screens.ParticleScreen.prototype.createParticles = function(){
    var particles = new game_shell.screens.Particles();
    particles.init({
        texture: PIXI.utils.TextureCache['menu_particle.png'],
        root: this,
        resolution: this.resolution
    });
    this.addUpdateItem(particles);
    return particles;
};

/**
 * @class Particles
 * @constructor
 */
game_shell.screens.Particles = function(){
    alex.game.ParticleBase.call(this);
};
game_shell.screens.Particles.prototype = Object.create(alex.game.ParticleBase.prototype);
//

game_shell.screens.Particles.prototype.createEmitter = function() {
    var lx = this.life * 0.35, ly = this.life * 0.5;
    var emitter = new Proton.Emitter();
    emitter.addInitialize(new Proton.ImageTarget(this.texture));
    emitter.rate = new Proton.Rate(5, 0.1);
    emitter.addInitialize(new Proton.Mass(1));
    emitter.addInitialize(new Proton.Life(lx, ly));
    emitter.addInitialize(new Proton.V(new Proton.Span(0.5, 1), new Proton.Span(0, 360), 'polar'));
    emitter.addBehaviour(new Proton.Alpha(1, [.7, 1]));
    emitter.addBehaviour(new Proton.Scale(Proton.getSpan(.5, 1.5), 0));
    return emitter;
};