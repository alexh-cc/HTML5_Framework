/**
 *
 */
game_shell.game.gameScreens = function(){

    /**
     *
     * @param p_event
     * @returns {screen}
     */
	this.createScreen = function(p_event){
		var screen,
            screenId = (typeof p_event == "string")? p_event : p_event.screenId;
		switch(screenId){
			case "load": screen = new alex.screens.LoadScreen(p_event); break;
			case "title": screen = new game_shell.screens.TitleScreen(p_event); break;
            case "dragonbones": screen = new game_shell.screens.DragonBonesScreen(p_event); break;
            case "spine": screen = new game_shell.screens.SpineScreen(p_event); break;
            case "font": screen = new game_shell.screens.FontScreen(p_event); break;
            case "particles": screen = new game_shell.screens.ParticleScreen(p_event); break;
            case "drag_n_drop": screen = new game_shell.screens.DragAndDropScreen(p_event); break;
            case "physics": screen = new game_shell.screens.PhysicsScreen(p_event); break;
		}
		return screen;
	};

    /**
     *
     * @param screenId
     * @returns {*}
     */
	this.getManifestPath = function(screenId){
        var scr = game_shell.screens, 
        	dir = alex.settings.JSON_DIR + 'manifests/',
        	file = null;
        switch(screenId){
            case "load":
                file = null;
                break;
        	case "physics":
        		file = dir + 'physics_manifest.json';
        		break;
        	case "dragonbones":
        		file = dir + 'dragonbones_manifest.json';
        		break;
        	case "spine":
        		file = dir + 'spine_manifest.json';
        		break;
        	case "font":
        		file = dir + 'font_manifest.json';
        		break;
        	case "particles":
        		file = dir + 'particle_manifest.json';
        		break;
            case "drag_n_drop":
        		file = dir + 'drag_n_drop_manifest.json';
        		break;
            default:
            	file = dir + 'asset_manifest.json';
        }
        return file;
    };

    /**
     *
     * @param screenId
     * @param jsonData
     */
    this.addToManifestJSON = function(screenId, jsonData){
    	var sid = (typeof screenId === 'string')? screenId : screenId.screenId;
        var scr = game_shell.screens,
            resolution = game_shell.resolution;
        //TODO - 
        /*switch(sid){
            case scr.SCR_GAME:
                // - load level specific assets, eg the map!
                var levelMap = this.mapForLevel();
                var mapNode = {
                  "src": "./json/maps/" + levelMap.src,
                  "id": "map"
                };
                jsonData.json[jsonData.json.length] = mapNode;
                //TODO - need to know whether to load the enemy robot!
                var hasEnemyWalk = true;//for now hardcode to true...
                if(hasEnemyWalk){
                    var enemyWalkNode = {
                        "src": "./json/bones/enemy_walk_skeleton.json",
                        "id": "enemy_walk_skeleton"
                    };
                    jsonData.json[jsonData.json.length] = enemyWalkNode;
                }
                break; 
        } */  
    };
};