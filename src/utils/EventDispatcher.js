/**
 * @author mrdoob / http://mrdoob.com/
 */

cc.core.utils.EventDispatcher = function () {}

cc.core.utils.EventDispatcher.prototype = {

	constructor: cc.core.utils.EventDispatcher,

	apply: function ( object ) {

		object.addEventListener = cc.core.utils.EventDispatcher.prototype.addEventListener;
		object.on = cc.core.utils.EventDispatcher.prototype.addEventListener;
		object.hasEventListener = cc.core.utils.EventDispatcher.prototype.hasEventListener;
		object.has = cc.core.utils.EventDispatcher.prototype.hasEventListener;
		object.removeEventListener = cc.core.utils.EventDispatcher.prototype.removeEventListener;
		object.off = cc.core.utils.EventDispatcher.prototype.removeEventListener;
		object.removeEventListeners = cc.core.utils.EventDispatcher.prototype.removeEventListeners;
		object.offAll = cc.core.utils.EventDispatcher.prototype.removeEventListeners;
		object.dispatchEvent = cc.core.utils.EventDispatcher.prototype.dispatchEvent;
		object.emit = cc.core.utils.EventDispatcher.prototype.dispatchEvent;

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
cc.core.utils.EventDispatcher.prototype.on = cc.core.utils.EventDispatcher.prototype.addEventListener;
cc.core.utils.EventDispatcher.prototype.emit = cc.core.utils.EventDispatcher.prototype.dispatchEvent;
cc.core.utils.EventDispatcher.prototype.has = cc.core.utils.EventDispatcher.prototype.hasEventListener;
cc.core.utils.EventDispatcher.prototype.off = cc.core.utils.EventDispatcher.prototype.removeEventListener;
cc.core.utils.EventDispatcher.prototype.offAll = cc.core.utils.EventDispatcher.prototype.removeEventListeners;
