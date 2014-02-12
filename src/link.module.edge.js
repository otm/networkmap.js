networkMap.Link.Module = networkMap.Link.Module || {};

/**
 * The Edge module is an UI widget for controling
 * the edge point of the link.
 *
 * @param {object} options Options to override defaults.
 * @constructor
 * @borrows networkMap.Options#setOptions as #setOptions
 */
networkMap.Link.Module.Edge = function(options){
	this.options = {
		x: null,
		y: null,
		dir: null,
		inset: 10,
		connectionDistance: 10,
		staticConnectionDistance: 10
	};

	this.setOptions(options);
};

networkMap.extend(networkMap.Link.Module.Edge, networkMap.Options);

/**
 * @lends networkMap.Link.Module.Edge
 */
networkMap.extend(networkMap.Link.Module.Edge, {
	initialize: function(){

	},

	show: function(){
		var edgePoint = this.properties.get('edgePoint');
		var edgeDirection = this.properties.get('edgeDirection');
	},


	hide: function(){

	},

	edgePoint: function(){
		if (this.options.x !== null && this.options.y !== null && this.options.dir !== null){
			return {
				x: this.options.x,
				y: this.options.y,
				dir: this.options.dir,
			};
		}


	},
	reset: function(){
		this.x = null;
		this.y = null;
		this.dir = null;
	}
});
