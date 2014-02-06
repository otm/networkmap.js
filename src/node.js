networkMap.Node = new Class({
	Implements: [Options, Events],
	
	/** These are sane defaults */
	options:{
		graph: null,
		id: null,
		name: null,
		comment: null,
		x: null,
		y: null,
		lat: null,
		lng: null,
		weight: null,
		fontFamily: 'Helvetica',
		fontSize: 16,
		bgColor: '#dddddd',
		strokeColor: '#000000',
		strokeWidth: 2,
		information: {
		},
		data:{
		},
		label: {
			position: 'internal',
			visable: true
			//renderer: 
		},
		renderer: 'rect', //rect, circle, image(url), svg(ulr)
		padding: 10,
		href: null,
		style: null,
		debug: false,
		draggable: false,
		events: null
		//onMove
	},
	_mode: 'normal',
	exportedOptions: [
		'id',
		'name',
		'comment',
		'x',
		'y',
		'lat',
		'lng',
		'weight',
		'renderer',
		'information',
		'label',
		'padding',
		'href',
		'style',
		'events',
		'fontFamily',
		'fontSize',
		'bgColor',
		'strokeColor',
		'strokeWidth' 
	],
	editTemplate: {
		id: {
			label: 'ID',
			type: 'text',
			disabled: true
		},
		name: {
			label: 'Name',
			type: 'text'
		},
		comment: {
			label: 'Comment',
			type: 'text'
		},
		padding: {
			label: 'Padding',
			type: 'number',
			min: 0
		},
		fontSize: {
			label: 'Font size',
			type: 'number',
			min: 1
		},
		bgColor: {
			label: 'Color',
			type: 'color'
		},
		strokeColor: {
			label: 'Stroke color',
			type: 'color'
		},
		strokeWidth: {
			label: 'Stroke width',
			type: 'number',
			min: 0
		}
		
	},
	initialize: function(options){
		this.graph = options.graph;
		delete options.graph;

		this._localConfig = options;

		if (this.graph){
			this.setOptions(this.graph.getDefaults('node'));
		}
		
		this.setOptions(options);

		if (!this.options.id){
			throw "Node(create, no id given)";
		}
		
		this.options.x = parseFloat(this.options.x);
		this.options.y = parseFloat(this.options.y);
		this.options.padding = parseFloat(this.options.padding); 

		this.setGraph(this.graph);
	},

	/**
	 * Update an option
	 *
	 * @param {string} The property to change
	 * @param {mixed} The value to set
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	setProperty: function(key, value){
		if (!this.editTemplate[key]){
			throw 'Unknow id: ' + key;
		}
		
		this.options[key] = value;
		this._localConfig[key] = value;
		
		this.draw();
		
		return this;
	},

	/**
	 * Ǵet a property value
	 *
	 * @param {string} The property to get
	 * @this {networkMap.Node}
	 * @return {mixed} The property value
	 */
	getProperty: function(key){
		if (!this.editTemplate[key]){
			throw 'Unknown id: ' + key;
		}
		
		return this._localConfig[key];
	},

	/**
	 * Genereats a configuration object
	 *
	 * @this {networkMap.Node}
	 * @return {Object} The node configuration
	 */
	getConfiguration: function(){
		var configuration = {};

		this.exportedOptions.each(function(option){
			if (this._localConfig[option]){
				configuration[option] = this._localConfig[option];
			}
		}.bind(this));
		
		return configuration;
	},

	/**
	 * Generates HTML that is used for configuration
	 *
	 * @this {networkMap.Node}
	 * @return {Element} A HTML Element that contains the UI
	 */
	getSettingsWidget: function(){
		var container = new networkMap.widget.Accordion();
		var accordionGroup;

		var changeHandler = function(key, obj){
			return function(e){
				obj.setProperty(key, e.target.value);	
			};
		};
	
		accordionGroup = container.add('Globals');		
		Object.each(this.editTemplate, function(option, key){
			if (option.type === 'number'){
				accordionGroup.grab(new networkMap.widget.IntegerInput(option.label, this.getProperty(key), option).addEvent('change', changeHandler(key, this)));
			}
			else if(option.type === 'text'){
				accordionGroup.grab(new networkMap.widget.TextInput(option.label, this.getProperty(key), option).addEvent('change', changeHandler(key, this)));
			}
			else if (option.type === 'color'){
				accordionGroup.grab(new networkMap.widget.ColorInput(option.label, this.getProperty(key), option).addEvent('change', changeHandler(key, this)));	
			}
		}.bind(this));
		
		return container;
	},
	
	/**
	 * Enable an event on the node
	 *
	 * @param {string} The type of event [hover|click]
	 * @this {options} The options for event
	 * @return {networkMap.Node} self
	 */
	enableEvent: function(name, options){
		if (name !== 'hover' && name !== 'click'){
			throw "Unknown event";
		}
		
		this.options.events = this.options.events || {};		
		this._localConfig.events = this._localConfig.events || {};
		
		var defaultOptions = {enabled: true};
		this.options.events[name] = options || defaultOptions;
		this._localConfig.events[name] = options || defaultOptions;

		return this;
	},
	
	/**
	 * Disable an event on the node
	 *
	 * @param {string} The type of event [hover|click]
	 * @return {networkMap.Node} self
	 */
	disableEvent: function(name, options){
		if (this.options.events && this.options.events[name]){
			delete this.options.events[name];
			delete this._localConfig.events[name];
		}
		
		return this;
	},
	
	/**
	 * Set the graph that the Node is associated to. 
	 * If set to null the Node will unregister from the 
	 * graph.
	 *
	 * @param {networkMap.Graph} The graph
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	setGraph: function(graph){

		// remove the current graph if it excists		
		if (this.graph){
			this.graph.removeEvent('redraw', this._redraw.bind(this));
			this.graph = null;
			this.draw();
		}

		// add graph object if it exists
		if (graph){
			this.graph = graph;
			this.graph.addEvent('redraw', this._redraw.bind(this));
			this.draw();
		}

		return this;
	},
	
	_redraw: function(){
		if (e.defaultsUpdated === true){
			this.setOptions(this.graph.getDefaults('node'));
			this.setOptions(this._localConfig);
		}
		this.draw();
	},

	/**
	 * Get/set the mode of the node. The mode can either
	 * be "normal" or "edit". In "edit" mode the nodes 
	 * clickHandler will not forward click events to
	 * click events registed with networkMap.registerEvent
	 *
	 * @param {string} The mode or undefined to get the mode
	 * @this {networkMap.Node}
	 * @return {networkMap.Node|String} Returns either the mode or 
	 * self
	 */
	mode: function(mode){
		if (!mode){
			return this._mode;
		}
		
		if (mode === 'edit' || mode === 'normal'){
			this._mode = mode;
		}
		else{
			throw 'Unknown mode: ' + mode;	
		}
		
		return this;
	},

	/**
	 * The clickHandler is an internal function which forwards
	 * click events to either the registed click event or to the 
	 * settingsManager.
	 *
	 * @param {Event} The click event
	 * @this {networkMap.Node}
	 * @return {undefined}
	 */
	_clickhandler: function(e){
		if (this._mode === 'normal' && this.options.events && this.options.events.click){
			networkMap.events.click(e, this);
		}
		else if (this._mode === 'edit'){
			e.preventDefault();
			this.graph.settings.edit(this);	
		}
	},	

	/**
	 * Get the x coordinate of the node
	 *
	 * @this {networkMap.Node}
	 * @return {number} The x coordinate of the node
	 */
	x: function(){
		return this.svg.bbox().x;
	},
	
	/**
	 * Get the y coordinate of the node
	 *
	 * @this {networkMap.Node}
	 * @return {number} The y coordinate of the node
	 */
	y: function(){
		return this.svg.bbox().y;
	},

	/**
	 * Make the node draggable
	 *
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	draggable: function(){
		this._draggable = true;
		this.svg.draggable({grid: this.graph.grid()});
		this.svg.remember('cursor', this.svg.style('cursor'));
		this.svg.style('cursor', 'move');
		
		return this;
	},	

	/**
	 * Make the node fixed, i.e. ńot draggable.
	 *
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	fixed: function(){
		this._draggable = false;
		this.svg.fixed();
		var cursor = this.svg.remember('cursor');
		this.svg.forget('cursor');
		this.svg.style('cursor', cursor || 'default');
		
		return this;
	},

	/**
	 * Returns true if the node is draggable
	 * false otherwise.
	 *
	 * @this {networkMap.Node}
	 * @return {boolean} The draggable status
	 */
	isDraggable: function(){
		return this._draggable;
	},

	/**
	 * This will create/update a link tag for the
	 * node. Order of presence is:
	 * - options.href
	 * - emit url event
	 *
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	updateLink: function(){
		var href = this.options.href;
		if (href){
			if (networkMap.isFunction(href))
				this.setLink(href(this));
			else
				this.setLink(href);
			return this;
		}
		
		this.fireEvent('requestHref', [this]);
		return this;
	},
	
	/**
	 * This will create/update the link to
	 * the specified URL.
	 *
	 * @param {string} The URL
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 * @TODO: Add functionality to remove the link
	 */
	setLink: function(url){
		if (url){
			if (this.link){
				this.link.to(url);
				return this;
			}
			
			this.link = this.svg.linkTo(url);
			return this;
		}
		
		return this;						
	},

	/**
	 * Get the bonding box of the node.
	 *
	 * @this {networkMap.Node}
	 * @return {SVG.BBox} The nodes bounding box
	 */
	bbox: function(){
		return this.svg.bbox();
	},

	/**
	 * Draw/redraw the node
	 *
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	draw: function(){
		var redraw = false;
		
		if (this.svg){
			this.svg.remove();
			if (this.link) link.remove();
		
			if (!this.graph)
				return false;			
			
			redraw = true;
		}
		
		if (!this.graph){
			return false;
		}
		
		if (this.debug){
			this.debug.remove();
		}
		
		if (this.options.debug){
			this.debug = this.graph.getPaintArea().group();
		}

		// create a group object 
		var svg = this.svg = this.graph.getPaintArea().group();
		
				
		this.updateLink();

		// create the label first to get size
		var label = svg.text(this.options.name)
			.font({
				family:   this.options.fontFamily,
				size:     this.options.fontSize,
				anchor:   'start',
				leading:  this.options.fontSize - 1
			})
			.move(parseFloat(this.options.padding), parseFloat(this.options.padding));

		
		// This is needed to center an scale the comment text
		// as it is not possible to get a bbox on a tspan
		var bboxLabel = label.bbox();
		var comment;
		if (this.options.comment && this.options.comment !== ''){
			label.text(function(add){
				add.tspan(this.options.name).newLine();
				comment = add.tspan(this.options.comment).newLine().attr('font-size', this.options.fontSize - 2);
			}.bind(this));
			comment.attr('text-anchor', 'middle');
			comment.dx(bboxLabel.width / 2);
		}	
		while (bboxLabel.width < label.bbox().width){
			comment.attr('font-size', comment.attr('font-size') - 1);
		}

		// create the rect
		bboxLabel = label.bbox();		
		var rect = svg.rect(1,1)
			.fill({ color: this.options.bgColor})
			.stroke({ color: this.options.strokeColor, width: this.options.strokeWidth })
			.attr({ 
				rx: 4,
				ry: 4
			})
			.size(
				bboxLabel.width + this.options.padding * 2, 
				bboxLabel.height + this.options.padding * 2
			);
							
		label.front();
		

		
		svg.on('click', this._clickhandler.bind(this));
		if (this.options.events){
			svg.link = this.options.events;
			
			if (this.options.events.click){
				svg.attr('cursor', 'pointer');
			}	
			
		}

		// this cover is here there to prevent user from selecting 
		// text in the label
		var cover = rect.clone().fill({opacity: 0}).front();

		// move it in place
		svg.move(parseFloat(this.options.x), parseFloat(this.options.y));
		
	
		
		if (this.options.draggable){
			this.draggable();
		}
		
		svg.dragmove = function(delta, event){
			this.fireEvent('drag', [delta, event]);
		}.bind(this);
		svg.dragstart = function(){
			this.fireEvent('dragstart');
		}.bind(this);
		svg.dragend = function(){
			this.options.x = this.x();
			this.options.y = this.y();
			this._localConfig.x = this.x();
			this._localConfig.y = this.y();
			this.fireEvent('dragend');
		}.bind(this);
		
		// need to make sure the draggable state persists
		if (this.isDraggable()){
			this.draggable();
		}

		this.fireEvent('dragend');

		return true;
	}
});

networkMap.Node.defaultTemplate = {
	padding: {
		label: 'Padding',
		type: 'number',
		min: 0
	},
	fontSize: {
		label: 'Font size',
		type: 'number',
		min: 1
	},
	bgColor: {
		label: 'Color',
		type: 'color'
	},
	strokeColor: {
		label: 'Stroke color',
		type: 'color'
	},
	strokeWidth: {
		label: 'Stroke width',
		type: 'number',
		min: 0
	}
};

/**
 * Register a global handler to provide a href to Nodes
 * This can be overridden on the networkMap instance or
 * or setting it directly on the node.
 * 
 * The registered function should return a url string 
 * or null if no link should be created. See implementation
 * of networkMap.Node._linkGenerator for a reference 
 * implementation
 *
 * @param {function} A function that returns an URL or null
 */
networkMap.Node.registerLinkGenerator = function(f){
	networkMap.Node._linkGenerator = function(node){
		if (node.options.href){
			if (networkMap.isFunction(node.options.href))
				node.setLink(node.options.href());
			else
				node.setLink(node.options.href);
			return;
		}
		
		node.setLink(f(node));
	};
};

/** Register a default link generator which will not create a link */
networkMap.Node.registerLinkGenerator(function(node){return null;});


/** Removed as we are going to change the implementation, kept for reference at the moment

networkMap.Node.renderer = networkMap.Node.renderer || {};

networkMap.registerNodeRenderer = function(name, renderer){
	networkMap.Node.renderer[name] = renderer;
};
networkMap.Node.renderer.rect = function(){};


networkMap.Node.label = networkMap.Node.label || {};
networkMap.Node.label.rederer = networkMap.Node.label.rederer || {};
networkMap.Node.label.rederer.normal = function(){};
*/