/**
 *
 * @constructor
 */
alex.utils.EventQueue = function(){
	alex.utils.EventDispatcher.call(this);

	this.queue = [];
};
alex.utils.EventQueue.prototype = Object.create(alex.utils.EventDispatcher.prototype);
alex.utils.EventQueue.prototype.constructor = alex.utils.EventQueue;

/**
 *
 * @param event
 */
alex.utils.EventQueue.prototype.queueEvent = function(event){
    this.queue[this.queue.length] = event;
};

/**
 *
 */
alex.utils.EventQueue.prototype.dispatchQueuedEvents = alex.utils.EventQueue.prototype.update = function(delta){
    while(this.queue.length > 0){
        this.dispatchEvent(this.queue.shift());
    }
};