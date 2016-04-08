game_shell.BootStrap = function(){
    alex.load.BootStrap.call(this);
    this.barColor = 0xea7a16;//23AFCD;
};
game_shell.BootStrap.prototype = Object.create(alex.load.BootStrap.prototype);

game_shell.BootStrap.prototype.defineBundle = function(){

    var imgFolder = alex.settings.IMG_DIR;
    var jsonFolder = alex.settings.JSON_DIR;

    // this.addJson({
    //     src: imgFolder + 'bootstrap/bootstrap_@' + this.resolution + 'x.json',
    //     id: 'loader'
    // });

    //this.addJson({
    //    src: jsonFolder + 'game_config.json',
    //    id: 'game_config'
    //});

    // this.addImage({
    //     src: imgFolder + 'bootstrap/bootstrap_@' + this.resolution + 'x.png',
    //     id: 'loader'
    // });

};

alex.load.BootStrap.prototype.createLoadBar = function(){
    var w = 10, h = 20;
    this.bar = new alex.display.Quad(w, h, this.barColor);
    this.bar.x = (this.stageW * -0.5);
    //put it at the bottom!
    this.bar.y = (this.stageH * 0.5) + (h * -0.5);
    this.stage.addChild(this.bar);
};