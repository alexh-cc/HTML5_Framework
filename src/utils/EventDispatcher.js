/**
 * @author mrdoob / http://mrdoob.com/
 */

alex.utils.EventDispatcher = function () {}

alex.utils.EventDispatcher.prototype = {

	constructor: alex.utils.EventDispatcher,

	apply: function ( object ) {

		object.addEventListener = alex.utils.EventDispatcher.prototype.addEventListener;
		object.on = alex.utils.EventDispatcher.prototype.addEventListener;
		object.hasEventListener = alex.utils.EventDispatcher.prototype.hasEventListener;
		object.has = alex.utils.EventDispatcher.prototype.hasEventListener;
		object.removeEventListener = alex.utils.EventDispatcher.prototype.removeEventListener;
		object.off = alex.utils.EventDispatcher.prototype.removeEventListener;
		object.removeEventListeners = alex.utils.EventDispatcher.prototype.removeEventListeners;
		object.offAll = alex.utils.EventDispatcher.prototype.removeEventListeners;
		object.dispatchEvent = alex.utils.EventDispatcher.prototype.dispatchEvent;
		object.emit = alex.utils.EventDispatcher.prototype.dispatchEvent;

	},

	addEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) this._listeners = {};

		var listeners = this._listeners;

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );

		}

	},

	hasEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return false;

		var listeners = this._listeners;

		if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {

			return true;

		}

		return false;

	},

	removeEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var index = listeners[ type ].indexOf( listener );

		if ( index !== - 1 ) {

			listeners[ type ].splice( index, 1 );

		}

	},

	removeEventListeners: function(){
		//remove all!
		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		for( var s in listeners){
			delete listeners[s];
		};

	},

	dispatchEvent: function ( event ) {

		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var listenerArray = listeners[ event.type ];

		if ( listenerArray !== undefined ) {

			event.target = this;

			for ( var i = 0, l = listenerArray.length; i < l; i ++ ) {

				listenerArray[ i ].call( this, event );

			}

		}

	},

	dispose:function(){
		if ( this._listeners === undefined ) {
			return;
		} else {
			this._listeners.length = 0;
			this._listeners = null;
		}
	}
};
//terser syntax...
alex.utils.EventDispatcher.prototype.on = alex.utils.EventDispatcher.prototype.addEventListener;
alex.utils.EventDispatcher.prototype.emit = alex.utils.EventDispatcher.prototype.dispatchEvent;
alex.utils.EventDispatcher.prototype.has = alex.utils.EventDispatcher.prototype.hasEventListener;
alex.utils.EventDispatcher.prototype.off = alex.utils.EventDispatcher.prototype.removeEventListener;
alex.utils.EventDispatcher.prototype.offAll = alex.utils.EventDispatcher.prototype.removeEventListeners;
