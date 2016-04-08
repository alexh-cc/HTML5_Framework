/**
 * Created with IntelliJ IDEA.
 * User: alex
 * Date: 2014/07/04
 * Time: 10:20 AM
 * Default loading bar
 */
alex.ui.LoadBar = function(p_w, p_h, p_color, p_color2){
    PIXI.Container.call(this);
    //
    
    var c1 = p_color || 0x000000;
    //draw a empty loadbar rect with a white outline
    var bg = new PIXI.Graphics();
    bg.beginFill(c1, 1.0);
    var lineW = 5;// * scaleFactor;//
    var half = lineW * 0.5;
    bg.lineStyle(lineW, 0xffffff, 1.0);
    bg.drawRect(-half, -half, p_w + lineW, p_h + lineW);
    bg.endFill();
    this.addChild(bg);

    //draw the progress bar rect
    var c2 = p_color2 || 0xCC9900;
    var barW = p_w + lineW;
    var barH = p_h + lineW;
    
    this.fullW = barW;

    var prgBar =  new alex.display.Quad(barW, barH, c2);
    prgBar.x = -half;
    prgBar.y = -half;
    //

    var fg = new PIXI.Graphics();
    fg.beginFill(c1, 0.0);
    fg.lineStyle(lineW, 0xffffff, 1.0);
    fg.moveTo(0, 0);
    fg.lineTo(p_w, 0);
    fg.lineTo(p_w, p_h);
    fg.lineTo(0, p_h);
    fg.lineTo(0, 0);
    fg.endFill();
    this.addChild(fg);
    //
    //p_amount = 0 - 1
    this.progress = function(p_amount){
        prgBar.width = p_amount * this.fullW;
        if(p_amount === 1){
            this.complete();
        }
    };
    this.complete = function(){
        prgBar.width = this.fullW;
        fg.visible = false;//hide line for fade out! 
        bg.visible = false;//hide line for fade out! 
    };
    this.progress(0);
    this.addChild(prgBar);

};
alex.ui.LoadBar.prototype = Object.create(PIXI.Container.prototype);
alex.ui.LoadBar.prototype.constructor = alex.ui.LoadBar;
