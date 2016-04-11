/**
 * game_shell - root object
 */
var game_shell = (function() {
    //game_shell version number
    this.version = "2.4.0";
    //
    this.config = {};//for external config
    //namespaces
    this.screens = {};
    this.game = {};
    this.data = {};
    this.utils = {};
    this.json = {};//used to store loaded json
    //prevent IE errors
    if(typeof window.console == 'undefined'){
        window.console = {};
        window.console.log = function(){};
    }
    /**
     * this gets called from html to start everything off
     * @method loadScripts
     */
    this.loadScripts = function() {
        var self = this, files = this.config.files.slice();
        this.ScriptLoader.load(files, function(){
            // disable native touchmove behavior to prevent overscroll
            if(typeof document.attachEvent != 'undefined'){
                document.attachEvent("ontouchmove", function(event) { event.preventDefault(); });
            } else {
                document.addEventListener("touchmove", function(event) { event.preventDefault(); }, false);
            }
            //init after 1 sec, allows window time to size properly
            setTimeout(function(){
                self.init.call(self);
            },1000);
        });
    };
    /**
     * this handles loading the scripts
     * @type {ScriptLoader}
     */
    this.ScriptLoader = {
        load: function(manifest, callback){
            this.manifest = manifest; this.callback = callback; 
            this.loadNext = this.loadNext.bind(this);
            this.loadNext();
        },
        loadScript: function(path, callback) {
            var head = document.getElementsByTagName('head')[0], script = document.createElement('script');
            script.type = 'text/javascript'; script.src = path; script.onload = callback;
            script.onreadystatechange = function() { if (this.readyState == 'complete') callback(); };
            head.appendChild(script);
        },
        loadNext: function(){
            (this.manifest.length > 0)? this.loadScript(this.manifest.shift(), this.loadNext) : this.callback();
        }
    };
    /**
     * callback after scripts have loaded
     * @method init
     */
    this.init = function(){
        //parse the config object
        cc.core.settings.copy(this.config);
        //call screen event to customize stuff
        this.onGameEvent({msg:"scripts_loaded"});
        //mixin game stuff
        cc.core.GenericGame.call(this);
    };
    // HOOK FOR EXTERNAL APIs
    this.onGameEvent = function(event){};
    //
    return this;
    //call in this scope not in window scope
}).call({});

//make a shortcut to get the game time
Object.defineProperties(game_shell, {
        time: {
            configurable: true,
            get: function(){
                return this.updateLoop.currentTime;
            }
        },
        resolution: {
            get: function(){
                return this.stage.renderer.resolution;
            }
        }
    } 
);