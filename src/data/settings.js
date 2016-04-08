//this is more like global config than settings so poorly named
alex.settings = {
    DEFAULT_W: 568,//<- default stage width in points
	DEFAULT_H: 320,//<- default stage height in points
    STAGE_W: 568,//<- actual stage width in points
    STAGE_H: 320,//<- actual stage height in points
    MIN_W: 400,//<- minimum stage width in points
    MIN_H: 320,//<- minimum stage height in points
    IPAD_W: 512,
    IPAD_H: 384,
    IPAD_MIN: 288,
    //
    CONTENT_SCALE: 1.0,//<- content scaling to fill window
    FONT: 'Arial',//<- default TTF font (maybe redundant)
    BG_COLOR: '#000000',//<- default div background colour
    //iframe mode - 1 = measure parent, 2 = measure iframe
    IFRAME_MODE: 2,
    //make it easy to customise the minimum sizes for each resolution
    RES_2_MIN_H: 320,
    RES_2_MIN_W: 640,//512,
    MAX_RESOLUTON: 2,
    //
    ORIENTATION: 2,//default
    ORIENTATION_PORTRAIT: 1,
    ORIENTATION_LANDSCAPE: 2,
    USE_WIDTH: false,//<- match width for resolution scaling
    /**
     * scale mode
     */
    SCALE_MODES: {
        MATCH_HEIGHT: 1,
        MATCH_WIDTH: 2
    },
    //
    MUTE_STATE: false,//<- allow muting before game loads
    CHECK_ORIENTATION: true,
    FULLSCREEN_ENABLED: true,//<- whether to allow full screen
    DESKTOP_FULLSCREEN: false,//<- whether to go full screen on desktop
    DESKTOP_RESIZE: true,//<- whether to resize screen on desktop
    WEB_AUDIO_ENABLED: true,
    WEB_GL_ENABLED: true,
    AUDIO_ENABLED: true,
    //paths
    IMG_DIR: "./img/",
    SND_DIR: "./snd/",
    JSON_DIR: "./json/",
    FONT_DIR: "./font/",
    GAME_ID: "template_game",//override this
    FIRST_SCREEN: "title",//default
    /**
     *
     * @param vars
     */
	copy:function(vars){
        for(var s in vars) if(vars.hasOwnProperty(s)) this[s] = vars[s];
        //change root dir if required
        if(vars.ROOT_DIR) this.setRootDir(vars.ROOT_DIR);
    },
    /**
     * this is used for match width mode
     */
    setIpad:function(){
        var isLandscape = (this.ORIENTATION === this.ORIENTATION_LANDSCAPE);
        var w = this.IPAD_W, h = this.IPAD_H, min = this.IPAD_MIN;
        this.DEFAULT_W = this.STAGE_W = isLandscape? w : h;
        this.DEFAULT_H = this.STAGE_H = isLandscape? h : w;
        this.MIN_W = isLandscape? w : min;
        this.MIN_H = isLandscape? min : w;
    },
    /**
     * this is default
     */
    setIphone:function(){
        var isLandscape = (this.ORIENTATION === this.ORIENTATION_LANDSCAPE);
        var minW = this.MIN_W, minH = this.MIN_H,
        stageW = this.STAGE_W, stageH = this.STAGE_H;
        this.DEFAULT_W = this.STAGE_W = isLandscape? stageW : stageH;
        this.DEFAULT_H = this.STAGE_H = isLandscape? stageH : stageW;
        this.MIN_W = isLandscape? minW : minH;
        this.MIN_H = isLandscape? minH : minW;
    },
    /**
     *
     * @param root
     */
    setRootDir: function(root){
        //make sure there is a slash
        var lastChar = root.charAt(root.length - 1);
        if(lastChar != '/') root += '/';
        this.IMG_DIR = root + "img/";
        this.SND_DIR = root + "snd/";
        this.JSON_DIR = root + "json/";
        this.FONT_DIR = root + "font/";
    }
  
};