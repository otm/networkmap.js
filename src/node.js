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

		if (options.view){
			this.view = networkMap.Node.createView(options.view.name, this.graph, options.view.options);
		}
		else{ // this is a compability shim for old configuration files
			this.view = networkMap.Node.createView('rect', this.graph, options);
		}

		/*** TODO: Removed temporary
		this._localConfig = options;

		if (this.graph){
			this.setOptions(this.graph.getDefaults('node'));
		}
		*/
		
		this.setOptions(options);

		if (!this.options.id){
			throw "Node(create, no id given)";
		}
		
		this.options.x = parseFloat(this.options.x);
		this.options.y = parseFloat(this.options.y);
		this.options.padding = parseFloat(this.options.padding); 

		if (this.graph){
			this.svg = this.view.render(this);
			
			this.graph.addEvent('redraw', function(e){
				/*** TODO: Remove
				if (e.defaultsUpdated === true){
					this.setOptions(this.graph.getDefaults('node'));
					this.setOptions(this._localConfig);
				}
				*/
				this.svg = this.view.render(this);
			}.bind(this));
		}

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
	get: function(key){return this.getProperty(key);},
	getProperty: function(key){
		if (!this.editTemplate[key]){
			throw 'Unknown id: ' + key;
		}
		
		return this.options[key];
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
		// remove the object from the graph
		this.graph = null;
		this.draw();

		// if a graph is defined draw 
		if (graph){
			this.graph = graph;
			this.draw();
		}

		return this;
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
		this.svg.draggable();
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
		
		if (this.svg && !this.graph){
			this.svg.remove();
			return false;
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
		
		if (this.svg){
			this.svg.remove();
			redraw = true;
		}

		// create a group object 
		var svg = this.svg = this.graph.getPaintArea().group();

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
			svg.link = model.options.events;
			
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

networkMap.Node.renderer = networkMap.Node.renderer || {};
networkMap.Node.defaults = networkMap.Node.defaults || {};

networkMap.Node.registerView = function(view){
	// add duck typing code

	if (!view.name) throw "name property missing";
	if (!view.renderer) throw "render property missing";
	view.defaults = view.defaults || {};

	networkMap.Node.defaults['NodeView' + view.name] = view.defaults;

	view.renderer.Implements = networkMap.Node.renderInterface;
	view.renderer.name = view.name;
	networkMap.Node.renderer['NodeView' + view.name] = new Class(view.renderer);
};


networkMap.Node.createView = function(name, graph, options){
	options = options || {};
	return new networkMap.Node.renderer['NodeView' + name](graph, options);
};

networkMap.Options = new Class({
	setOptions: function(){
		var options = this.options = Object.merge.apply(null, [{}, this.options].append(arguments));
		if (this.addEvent) for (var option in options){
			if (typeOf(options[option]) != 'function' || !(/^on[A-Z]/).test(option)) continue;
			this.addEvent(option, options[option]);
			delete options[option];
		}
		return this;
	}
});


networkMap.Node.baseRenderer = new Class({
	Implements: [networkMap.Options, Events],
	options: {},
	initialize: function(graph){
		this.graph = graph;

		if (this.setup && typeof this.setup === 'function'){
			this.setup();
		}
	},

	set: function(key, value){
		this.options[key] = value;

		return this;
	},

	get: function(key){
		return (!!this.options[key]) ? this.options[key] : this.graph.getDefault('NodeView' + this.name, key).value;
	}

});

networkMap.Node.renderInterface = new Class({
	Extends: networkMap.Node.baseRenderer,

	//defaults: {},
	
	//setup: function(){},

	//getSettingsWidget: function(){},

	//render: function(){}
});




networkMap.Node.registerView({
	name: 'rect', 
	defaults: {
		padding: {
			label: 'Padding',
			type: 'number',
			min: 0,
			value: 10
		},
		fontSize: {
			label: 'Font size',
			type: 'number',
			min: 4,
			value: 16
		},
		bgColor: {
			label: 'Color',
			type: 'color',
			value: '#dddddd'
		},
		strokeColor: {
			label: 'Stroke color',
			type: 'color',
			value: '#000000'
		},
		strokeWidth: {
			label: 'Stroke width',
			type: 'number',
			min: 0,
			value: 2
		},
		fontFamily: {
			label: 'Font family',
			type: 'text',
			value: 'Helvetica',
			display: 'none'
		}
	},

	renderer: {
		setup: function(options){

		},

		render: function(model){
			var svg = this.graph.getPaintArea().group(), graph = this.graph;

			if (this.debugLayer){
				this.debugLayer.remove();
			}
			
			if (this.options.debug){
				this.debugLayer = graph.getPaintArea().group();
			}
			
			// create the label first to get size
			var label = svg.text(model.get('name'))
				.font({
					family:   this.get('fontFamily'),
					size:     this.get('fontSize'),
					anchor:   'start',
					leading:  this.get('fontSize') - 1
				})
				.move(parseFloat(this.get('padding')), parseFloat(this.get('padding')));

			
			// This is needed to center an scale the comment text
			// as it is not possible to get a bbox on a tspan
			var bboxLabel = label.bbox();
			var commentText = model.get('comment');
			var comment;
			if (commentText && commentText !== ''){
				label.text(function(add){
					add.tspan(this.get('name')).newLine();
					comment = add.tspan(commentText).newLine().attr('font-size', this.get('fontSize') - 2);
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
				.fill({ color: this.get('bgColor')})
				.stroke({ color: this.get('strokeColor'), width: this.get('strokeWidth') })
				.attr({ 
					rx: 4,
					ry: 4
				})
				.size(
					bboxLabel.width + this.get('padding') * 2, 
					bboxLabel.height + this.get('padding') * 2
				);
								
			label.front();
			

			
			//svg.on('click', this._clickhandler.bind(this));
			if (model.options.events){
				svg.link = model.options.events;
				
				if (model.options.events.click){
					svg.attr('cursor', 'pointer');
				}	
				
			}

			// this cover is here there to prevent user from selecting 
			// text in the label
			var cover = rect.clone().fill({opacity: 0}).front();

			// move it in place
			svg.move(parseFloat(model.options.x), parseFloat(model.options.y));
			

			
			if (this.options.draggable){
				this.draggable();
			}
			
			svg.dragstart = function(){
				this.fireEvent('dragstart');
			}.bind(this);

			svg.dragmove = function(delta, event){
				this.fireEvent('drag', [delta, event]);
			}.bind(this);
			
			svg.dragend = function(){
				this.options.x = this.x();
				this.options.y = this.y();
				this._localConfig.x = this.x();
				this._localConfig.y = this.y();
				this.fireEvent('dragend');
			}.bind(this);
			
			// need to make sure the draggable state persists
			if (model.isDraggable()){
				svg.draggable();
			}

			// why
			this.fireEvent('dragend');

			return svg;
		},

		getSettingsWidget: function(){

		}

	}
});
