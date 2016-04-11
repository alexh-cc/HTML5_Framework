game_shell.screens.DragonBonesScreen = function (config) {
    game_shell.screens.ExampleScreen.call(this, config)
};
game_shell.screens.DragonBonesScreen.prototype = Object.create(game_shell.screens.ExampleScreen.prototype);
game_shell.screens.DragonBonesScreen.prototype.constructor = game_shell.screens.DragonBonesScreen;

/**
 *
 */
game_shell.screens.DragonBonesScreen.prototype.run = function () {
    console.log('DragonBonesScreen');

    this.initRobot();

    this.createTestButton();

    this.createBackButton();
};

/**
 *
 */
game_shell.screens.DragonBonesScreen.prototype.initRobot = function () {
    this.robot = this.createBonesSprite(100);

    this.addChild(this.robot.root);

    this.addUpdateItem({
        update: function (delta) {
            dragonBones.animation.WorldClock.clock.advanceTime(delta / 1000);
        }
    });

    this.robot.play('walk_left');
};

/**
 * @method createBonesSprite
 * @param y
 * @returns {dragonBones.BonesSprite}
 */
game_shell.screens.DragonBonesScreen.prototype.createBonesSprite = function (y) {
    var armatureData = {
        resolution: this.resolution,
        armatureName: 'robot_1',
        skeletonId: 'robot_1',
        skeletonJSON: game_shell.json['robot_skeleton'],
        atlasJson: game_shell.json['robot'],
        animationId: 'idle_right',
        partsList: [
            "face_left-head_left.png",
            "face_left-left_foot_left.png",
            "face_left-left_lower_arm_left.png",
            "face_left-left_lower_leg_left.png",
            "face_left-left_upper_arm_left.png",
            "face_left-left_upper_leg_left.png",
            "face_left-right_foot_left.png",
            "face_left-right_lower_arm_left.png",
            "face_left-right_lower_leg_left.png",
            "face_left-right_upper_arm_left.png",
            "face_left-right_upper_leg_left.png",
            "face_left-torso_left.png",
            "face_rear-head_behind.png",
            "face_rear-left-foot-behind.png",
            "face_rear-left-lower-arm-behind.png",
            "face_rear-left-lower-leg-behind.png",
            "face_rear-left-upper-arm-behind.png",
            "face_rear-left-upper-leg-behind.png",
            "face_rear-right-foot-behind.png",
            "face_rear-right-lower-arm-behind.png",
            "face_rear-right-lower-leg-behind.png",
            "face_rear-right-upper-arm-behind.png",
            "face_rear-right-upper-leg-behind.png",
            "face_rear-torso_behind.png",
            "face_right-head.png",
            "face_right-left_foot.png",
            "face_right-left_lower_leg.png",
            "face_right-left_lower_rm.png",
            "face_right-left_upper_arm.png",
            "face_right-left_upper_leg.png",
            "face_right-right_foot.png",
            "face_right-right_lower_arm.png",
            "face_right-right_lower_leg.png",
            "face_right-right_upper_arn.png",
            "face_right-right_upper_leg.png",
            "face_right-torso.png"
        ]
    };
    var robot = new dragonBones.BonesSprite();
    robot.init({armatureData: armatureData, x: 0, y: y});
    return robot;
};



game_shell.screens.DragonBonesScreen.prototype.createTestButton = function () {
    var q = new cc.core.display.Quad(30, 30);
    q.x = -100;
    q.y = -100;
    this.addChild(q);
    q.interactive = true;

    this.toggleDirection = true;

    var self = this;
    q.on('mousedown', function(){
        self.switchTimeline();
    })
};

game_shell.screens.DragonBonesScreen.prototype.switchTimeline = function () {

    if(this.toggleDirection){
        this.robot.play('walk_right');
    } else {
        this.robot.play('walk_left');
    }
    this.toggleDirection = !this.toggleDirection;
};