//mixin
game_shell.game.gameScreens = function(){

    /**
     * @method createScreen
     * @param event
     * @returns {Screen}
     */
	this.createScreen = function(event){
		var screen,
            screenId = (typeof event == "string")? event : event.screenId;
		switch(screenId){
			case "load": screen = new alex.screens.LoadScreen(event); break;
			case "title": screen = new game_shell.screens.TitleScreen(event); break;
			case "menu": screen = new game_shell.screens.MenuScreen(event); break;
			case "game": screen = new game_shell.screens.GameScreen(event); break;
		}
		return screen;
	};

    /**
     * @method getManifestPath
     * @param screenId
     * @returns {string}
     */
    this.getManifestPath = function(screenId){
        var dir = alex.settings.JSON_DIR + 'manifests/',
            file = null;
        switch(screenId){
            case "load":
                file = null;
                break;
            default:
                file = dir + 'asset_manifest.json';
        }
        return file;
    };
};