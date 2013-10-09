/*
 * Add dirty state for save
 * Add "add" interface and button to control it
 * Add interface should be able to load link data
 * Delete action should be in the edit view of the element
 * Edit of link should be done by the add interface
 *
 * networkMap.Node.registerView(name, defaults, view)
 * When initializing the networkMap.Graph it will defaults from registed node views
 * This is the interface for the view
 *	networkMap.Node.renderInterface = new Class({
 *		Implements: [networkMap.Options],
 * 
 *		setOption: function(name, value){
 *			return this;
 *		},
 *		getSettingsWidget: function(),
 *		render: function(){},
 *		redraw: function(){},
 *	});
 * networkMap.Node							The node controller
 * options: {}								Options for the controller
 * model: {}								Contains all persistant data
 * setProperty: function(key, value)		get/set data in the model (depricated)
 * getProperty: function(key)				get/set data in the model (depricated)
 * getConfiguration: function()				get configuration representation 
 * get: function(key, noDefaultLookup)		get property from model/default configuration
 * set: function(key, value)				set property in model	
 * getSettingsWidget: function()			get a DOM node containing a configuration view
 * enableEvent: function(name, options)		enable events
 * disableEvent: function(name, options)	disable event
 * graph: function(graph)					get/set graph (is this needed?)
 * mode: function(mode)						get/set mode of graph
 * _clickhandler: function(e)				onClick router
 * x: function()							get/set x-coordinate (should be replaced with property)
 * y: function()							get/set y-coordinate (should be replaced with property)
 * draggable: function()					enable drag on node
 * fixed: function()						disable drag on node
 * isDraggable: function()					get drag status
 * bbox: function()							returns the bbox (add caching to this function)
 * draw: function()							draw/redraw using the current view
 * view: function()							get/set the view
 * reset: function()						clear the configuration of the node
 */

var networkMap = networkMap || {};

networkMap.Exception = function(message){
	this.message = message;
	this.name = "networkMapException";
};

networkMap.path = function(svg){
	return svg.path().attr({ 
		fill: 'none',
		stroke: '#000'
	});
};

/* Extending Mootools functionality */

Array.implement('find', function(fn){
	for (var i = 0; i < this.length; i++){
		if (fn.call(this, this[i], i, this)) 
			return this[i];
	}
});
