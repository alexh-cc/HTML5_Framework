alex.game.HitTest = {
    intersects: function(Object1, Object2){
        var overlap = this._intersection(Object1, Object2);
        return overlap > 0;
    },
    radius: function(pt1, pt2, radius){
        var dist = this._distance(pt1, pt2);
        return dist < radius;
    },
    _intersection: function(Object1, Object2){
        var overlap = 0;//return value
        var obj1R = Object1.x + Object1.width, obj2R = Object2.x + Object2.width,
            obj1B = Object1.y + Object1.height, obj2B = Object2.y + Object2.height;
        if(obj1R > Object2.x && Object1.x < obj2R &&
            obj1B > Object2.y && Object1.y < obj2B){
            //find biggest x & smallest r
            var biggestX = Math.max(Object1.x, Object2.x);
            var smallestR = Math.min(obj1R, obj2R);
            var overlapX = smallestR - biggestX;
            //now do the y
            var biggestY = Math.max(Object1.y, Object2.y);
            var smallestB = Math.min(obj1B, obj2B);
            var overlapY = smallestB - biggestY;
            //return the bigger of the two
            overlap = Math.max(overlapX, overlapY);
        }
        return overlap;
    },
    _distance: function(pt1, pt2){
        var distX = Math.abs(pt2.x - pt1.x),
            distY = Math.abs(pt2.y - pt1.y);
        return Math.sqrt((distX * distX) + (distY * distY));
    }
};
