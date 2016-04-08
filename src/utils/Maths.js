/**
 * Collection of useful maths functions for dealing with vectors, etc
 */
alex.utils.Maths = {

    /**
     * @method rotate
     * @param point {Point}
     * @param angle {Number}
     * @param output {Point}
     * @returns {*}
     */
    rotate: function (point, angle, output) {
        var x = point.x, y = point.y;
        if(!output) output = point;
        output.x = ((Math.cos(-angle) * x) + (Math.sin(-angle) * y));
        output.y = ((-Math.sin(-angle) * x) + (Math.cos(-angle) * y));
        return output;
    },

    /**
     * @method matrixRotatePoint
     * @param p {Point}
     * @param m {Matrix}
     * @param pt {Point}
     * @returns {*}
     */
    matrixRotatePoint: function (p, m, pt) {
        var x = p.x, y = p.y;
        var output = pt || p;
        output.x = m.a * x + m.c * y;
        output.y = m.d * y + m.b * x;
        return output;
    },
    /**
     * @method dot
     * @param a {Vector}
     * @param b {Vector}
     * @returns {number}
     */
    dot: function (a, b) {
        return (a.x * b.x) + (a.y * b.y);
    },
    /**
     *
     * @param vector
     * @returns {number}
     */
    vectorLengthSquared: function (vector) {
        return ((vector.x * vector.x) + (vector.y * vector.y));
    },
    /**
     *
     * @param vector
     * @returns {number}
     */
    vectorLength: function (vector) {
        return Math.sqrt(this.vectorLengthSquared(vector));
    },
    /**
     *
     * @param vectorA
     * @param vectorB
     * @returns {*}
     */
    vectorDistanceSquared: function (vectorA, vectorB) {
        return this.vectorLengthSquared(this.relativeVector(vectorA, vectorB));
    },
    /**
     *
     * @param origin
     * @param target
     * @param output
     * @returns {*}
     */
    relativeVector: function (origin, target, output) {
        if (!output) output = {};
        output.x = target.x - origin.x;
        output.y = target.y - origin.y;

        return output;
    },
    /**
     *
     * @param vectorA
     * @param vectorB
     * @returns {number}
     */
    vectorDistance: function (vectorA, vectorB) {
        return Math.sqrt(this.vectorDistanceSquared(vectorA, vectorB));
    },
    /**
     *
     * @param vector
     * @returns {*}
     */
    normaliseVector: function (vector) {
        return this.scaleVector(vector, 1 / this.vectorLength(vector));
    },
    /**
     *
     * @param vector
     * @param scale
     * @param output
     * @returns {*}
     */
    scaleVector: function(vector,scale, output) {
        if(!output) output = vector;
        output.x = vector.x * scale;
        output.y = vector.y * scale;
        return output;
    },

    /**
     *
     * @param vertices {Array}
     * @returns {number}
     */
    polygonDirection: function(vertices){
        //http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order
        var i, v1, v2, next, value, n = vertices.length, total = 0;
        for(i = 0; i < n; i++){
            next = (i + 1) % n;
            v1 = vertices[i];
            v2 = vertices[next];
            value = (v2.x - v1.x) * (v2.y - v1.y);
            total += value;
        }
        //NOTE - because y axis points down
        //clockwise is indicated by the result being LESS than zero
        //if its GREATER than zero then its anticlockwise
        return total;
    },

    /**
     *
     * @param vertices
     * @returns {boolean}
     */
    isClockwise: function(vertices){
        var total = this.polygonDirection(vertices);
        return total < 0;
    }
};
