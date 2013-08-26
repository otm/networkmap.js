var networkMap = networkMap || {};

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
;networkMap.widget = networkMap.widget || {};

networkMap.widget.IntegerInput = new Class ({
	Implements: [Options, Events],
	options: {
		class: 'nm-input-integer'
	},
	wrapper: null,
	label: null,
	input: null,
	initialize: function(label, value, options){
		this.setOptions(options);
		this.wrapper = new Element('div', {
			class: this.options.class
		});
		this.label = new Element('span', {
			text: label
		});
		this.input = new Element('input', {
			type: 'text',
			value: value
		}).addEvent('change', function(e){
			this.fireEvent('change', [e]);
		}.bind(this)); 
		
		if (this.options.disabled === true){
			this.input.disabled = true;
		}
		
		this.wrapper.grab(this.label).grab(this.input);
	},
	toElement: function(){
		return this.wrapper;
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.TextInput = new Class ({
	Implements: [Options, Events],
	options: {
		class: 'nm-input-text'
	},
	wrapper: null,
	label: null,
	input: null,
	initialize: function(label, value, options){
		this.setOptions(options);
		this.wrapper = new Element('div', {
			class: this.options.class
		});
		this.label = new Element('span', {
			text: label
		});
		this.input = new Element('input', {
			type: 'text',
			value: value
		}); 
	
		if (this.options.disabled === true){
			this.input.disabled = true;
		}
		
		this.wrapper.grab(this.label).grab(this.input);
	},
	toElement: function(){
		return this.wrapper;
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.Accordion = new Class ({
	Implements: [Options, Events],
	options: {
		class: 'nm-accordion'
	},
	wrapper: null,
	items: [],
	initialize: function(options){
		this.setOptions(options);
		this.wrapper = new Element('div', {
			class: this.options.class
		});
	},
	toElement: function(){
		return this.wrapper;
	},
	add: function(label, options){
		var item = new Element ('div', {
			class: 'nm-accordion-group nm-accordion-open'	
		});
		
		
		var trigger = new Element('div', {
			class: 'nm-accordion-trigger unselectable',
			text: label
		});
		
		var list = new Element('ul', {
			class: 'nm-accordion-inner'	
		});
		if (options && options.id){
			list.set('id', options.id);		
		}
		item.grab(trigger);
		item.grab(list);
		this.items.push(item);
		this.wrapper.grab(item);	
		
		trigger.addEvent('click', this.clickHandler.bind(this));	

		return list;
	},
	clickHandler: function(e){
		e.target.getParent().toggleClass('nm-accordion-open');
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.List = new Class ({
	Implements: [Options, Events],
	options: {
		class: 'nm-list'
	},
	list: null,
	listItems: [],
	initialize: function(options){
		this.setOptions(options);
		this.list = new Element('ul', {
			class: this.options.class
		});
	},
	toElement: function(){
		return this.list;
	},
	add: function(element, options){
		var listItem = new networkMap.widget.ListItem(element, options);
		listItem.addEvent('remove', this.remove.bind(this));
		this.listItems.push(listItem);
		this.list.grab(listItem);
		
		return listItem;
	},
	remove: function(listItem){
		this.listItems = this.listItems.erase(listItem);
		
		return this;
	}
});

networkMap.widget.ListItem = new Class ({
	Implements: [Options, Events],
	options: {
		class: 'nm-list-item',
		enableDelete: false
	},
	initialize: function(element, options){
		this.setOptions(options);
		this.listItem = new Element('li', {
			class: this.options.class
		});
		
		if (typeof element == 'string'){
			this.listItem.set('text', element);	
		}
		else {
			this.listItem.grab(element);	
		}
		if (this.options.enableDelete){
			this.listItem.grab(new Element('span', {
				text: 'x',
				class: 'nm-list-item-delete pull-right',
				events: {
					click: this.remove.bind(this)
				}
			}));	
		}
	},
	remove: function(){
		this.listItem.destroy();
		delete this.listItem;
		this.fireEvent('remove', [this]);
		
		return this;
	},
	toElement: function(){
		return this.listItem;
	}
});

;networkMap.widget = networkMap.widget || {};

networkMap.widget.Select = new Class ({
	Implements: [Options, Events],
	options: {
		class: 'nm-input-select'
	},
	wrapper: null,
	label: null,
	input: null,
	initialize: function(label, values, options){
		this.setOptions(options);
		this.wrapper = new Element('div', {
			class: this.options.class
		});
		this.label = new Element('span', {
			text: label
		});
		
		this.input = new Element('select')
		.addEvent('change', function(e){
			this.fireEvent('select', [e, this]);
		}.bind(this)); 
	
		if (this.options.disabled === true){
			this.input.disabled = true;
		}
		
		this.addOptions(values);
		this.wrapper.grab(this.label).grab(this.input);
	},
	addOptions: function(values){
		values.each(function(value){
			this.addOption(value);
		}.bind(this));
	},
	addOption: function(value, selected){
		this.input.grab(new Element('option', {
			value: value,
			text: value,
			selected: selected
		}));
		return this;
	},
	getSelected: function(){
		return this.input.getSelected()[0].value;
	},
	clearOptions: function(){
		this.input.empty();
		return this;
	},
	toElement: function(){
		return this.wrapper;
	},
	toString: function(){
		return this.getSelected();	
	}
});;networkMap.datasource = networkMap.datasource || {};

/**
 * Register a datasource
 *
 * @param {string} name The name of the datasource.
 * @param {function} f The datasource
 */
networkMap.registerDatasource = function(name, f){
	networkMap.datasource[name] = function(url, requests){
		if (typeOf(requests) !== 'array'){
			requests = [requests];
		}
		f(url, requests);
	};
};

/**
 * Dummy datasource used for simulation and testing.
 * The requests array contains object of the form:
 * {
 *		link: {Sublink} 
 *		callback: {function}
 * }
 * Use the link to gather data to send with the request,
 * when the request is made send the data to the callback.  
 *
 * @param {string} url The URL to send the request to.
 * @param {Array} requests An array of requests. 
 * @return null.
 */
networkMap.registerDatasource('simulate', function(url, requests){
	requests.each(function(request){
		var dataPoint = Math.random();

		// Example on how to get the node to get node specific data
		//request.link.getNode().options.id;

		request.callback({
			url: url,
			request: request.link,
			value: dataPoint,
			realValue: Math.round(dataPoint * 100) + 'Mbps'
		});
	});
});;networkMap.events = networkMap.events || {
	click: function(e, link){
		if (link.options.events.click.href){
			window.location.href = link.options.events.click.href;
		}
	},
	hover: function(e, link){
		var el = document.id('nm-active-hover');
		var id = e.target.instance.attr('id');
		
		if (el){
			if (el && el.retrieve('id') !== e.target.instance.attr('id')){
				el.destroy();	
			}
			else{
				el.store('keep', true);
				return;
			}	
		}
		
		
		var position = e.target.getPosition(),
			svg = e.target.instance;
			
			
		var segment11 = svg.getSegment(2),
			segment12 = svg.getSegment(3),
			segment21 = svg.getSegment(5),
			segment22 = svg.getSegment(6);
		
		var midX = ((segment11.coords[0] + segment22.coords[0])/2 +
			(segment12.coords[0] + segment21.coords[0])/2)/2;

		var midY = ((segment11.coords[1] + segment22.coords[1])/2 +
			(segment12.coords[1] + segment21.coords[1])/2)/2;

		el = new Element('div', {
			'id': 'nm-active-hover',
			'class': 'nm-hover',
			'text': link.options.name,
			events: {
				mouseover: function(){
					el.store('mouseover', true);
				},
				mouseout: function(){
					el.eliminate('mouseover');
					(function(){
						if (!el.retrieve('keep'))
							el.destroy();
						else
							el.eliminate('keep');
					}).delay(10);
				},
				click: function(ev){
					// swap targets :)
					//ev.target = e.target;
					//e.target.instance.clickHandler(e);
					link._clickHandler(e);
				}
					
				
			}
		})
		.store('id', e.target.instance.attr('id'));
		
		el.setStyles({
			top: -1000,
			left: -1000	
		});
				
		
		document.id(document.body).grab(el);
		var size = el.getSize();
		el.setStyles({
			top: midY - size.y/2 + e.target.instance.doc().parent.getPosition().y,
			left: midX - size.x/2 + e.target.instance.doc().parent.getPosition().x
		});
		

	},
	mouseover: function(e, options, hover){
		console.log("mouse over");
	},
	mouseout: function(e, options, hover){
		console.log('mouse out');	
	}
};

networkMap.registerEvent = function(name, f){
	if (!networkMap.events[name])
		throw "Invalid event: " + name + " is not an registered event";
	
	if (name === 'click'){
		networkMap.events[name] = function(e, link){
			//var options = (e.target.instance.link) ? e.target.instance.link.click : e.target.instance.parent.link.click;
			f(e, link);
		};
	}
	else if (name === 'hover'){	
		networkMap.events.mouseover = function(e, link){
			f(e, link);
		};
		
		networkMap.events.mouseout = function(e, link){
			var options = e.target.instance.link;
			(function(){
				var el = document.id('nm-active-hover');
				if (el && el.retrieve('id') !== e.target.instance.attr('id')){
					return;	
				}

				if (el && !el.retrieve('mouseover')){
					el.destroy();
				}
			}).delay(10);
		};
	}
	else{
		networkMap.events[name] = f;	
	}
};

networkMap.registerEvent('click', networkMap.events.click);
networkMap.registerEvent('mouseover', networkMap.events.mouseover);
networkMap.registerEvent('mouseout', networkMap.events.mouseout);
networkMap.registerEvent('hover', networkMap.events.hover);;
networkMap.colormap = networkMap.colormap || {};


/**
 * Register a color map. After a color map is registed
 * it can be used in the graph. 
 *
 * @param {String} The name of the colormap
 * @param {Object} colormap
 * @param {array} colormap.map The color values
 * @param {array} colormap.limits The limits associated with colormap.map
 * @param {string} colormap.nodata The color if no data is available
 * @param {function} colormap.translate(value) A function that takes a value [0:1|undefined] and returns a color
 */
networkMap.registerColormap = function(name, colormap){
	networkMap.colormap[name] = colormap;
};

/**
 * Rasta5 colormap
 */
networkMap.colormap.rasta5 = {
	translate: function(value){
		if (!value)
			return networkMap.colormap.rasta5.nodata;

		if (value < 0.2)
			return networkMap.colormap.rasta5.map[0];

		if (value < 0.4)
			return networkMap.colormap.rasta5.map[1];

		if (value < 0.6)
			return networkMap.colormap.rasta5.map[2];
		
		if (value < 0.8)
			return networkMap.colormap.rasta5.map[3];
		
		return networkMap.colormap.rasta5.map[4];
	},
	map: [
		'#3DDE1E',
		'#9BEC1A',
		'#F9EB18',
		'#F98020',
		'#F51329'
	],
	limits: [
		0.2,
		0.4,
		0.6,
		0.8,
		1
	],
	nodata: '#C0C0C0'
};

/**
 * Flat5 colormap
 */
networkMap.colormap.flat5 = {
	translate: function(value){
		var map = networkMap.colormap.flat5;
		if (!value)
			return map.nodata;

		if (value < 0.2)
			return map.map[0];

		if (value < 0.4)
			return map.map[1];

		if (value < 0.6)
			return map.map[2];
		
		if (value < 0.8)
			return map.map[3];
		
		return map.map[4];
	},
	map: [
		'#27ae60',
		'#2ecc71',
		'#f1c40f',
		'#e67e22',
		'#c0392b'
	],
	limits: [
		0.2,
		0.4,
		0.6,
		0.8,
		1
	],
	nodata: '#ecf0f1'
};
;networkMap.ColorLegend = new Class({
	Implements: [Options],
	options: {
		/** The size of the the color square */
		boxSize: 25,
		/** margin */
		margin: 10
	},

	/** The graph object to attach to */
	graph: null,
	
	/**
	 * Creates an instance of networkMap.ColorLegend.
	 *
	 * @constructor
	 * @this {networkMap.ColorLegend}
	 * @param {string} The name of the colormap
	 * @param {Object} A options object.
	 */
	initialize: function(colormap, options){
		this.graph = options.graph;
		delete options.graph;

		this.setOptions(options);
		this.colormap = networkMap.colormap[colormap];

		if (!this.colormap){
			throw 'Colormap "' + colormap + '" is not registerd';
		}

		this.graph.addEvent('resize', this.move.bind(this));

		this.draw();
	},

	/**
	 * Draw/redraw the legend in the graph
	 *
	 * @this {networkMap.ColorLegend}
	 * @return {networkMap.ColorLegend} self
	 */
	draw: function(){
		var colormap = this.colormap.map;
		var svg = this.svg = this.graph.getSVG().group();

		colormap.each(function(color, index){
			svg.rect(this.options.boxSize, this.options.boxSize).attr({
				fill: color,
				'stroke-width': 1
			}).move(0, (colormap.length - 1 - index) * this.options.boxSize);

			svg.line(
				-5, (colormap.length - 1 - index) * this.options.boxSize,
				0, (colormap.length - 1 - index) * this.options.boxSize
			).attr({
				stroke:'#000'

			});

			svg.text(this.colormap.limits[index].toString() * 100 + '%')
				.attr({
					'text-anchor': 'end',
					'font-size': this.options.boxSize/2
				})
				.move(
				-this.options.boxSize/2, 
				(colormap.length - 1.3 - index) * this.options.boxSize ,
				'end'
			);
		}.bind(this));

		svg.line(
			-5, (colormap.length) * this.options.boxSize,
			0, (colormap.length) * this.options.boxSize
		).attr({
			stroke:'#000'

		});

		svg.text('0%')
			.attr({
				'text-anchor': 'end',
				'font-size': this.options.boxSize/2
			})
			.move(
			-this.options.boxSize/2, 
			(colormap.length - 0.3) * this.options.boxSize ,
			'end'
		);

		this.move();

		return this;
	},

	/**
	 * Move the legend to the x and y coordinate.
	 *
	 * @this {networkMap.ColorLegend}
	 * @return {networkMap.ColorLegend} self
	 * @todo clean up 
	 */
	move: function(x, y){
		var docSize;		
		if (!x || !y){
			docSize = this.graph.element.getSize();	
		}
		
		
		if (docSize.x && docSize.y){
			this.svg.move(
				docSize.x - this.options.boxSize - this.options.margin , 
				docSize.y - this.options.boxSize * this.colormap.map.length - this.options.margin
			);
		}
		
		return this;
	}

});
;networkMap.SettingsManager = new Class ({
	Implements: [Options, Events],
	
	options: {
		//onActive
		//onDeactive
		//onSave
	},
	
	container: null,
	editing: false,

	/**
	 * Creates an instance of networkMap.SettingsManager.
	 *
	 * @constructor
	 * @this {networkMap.SettingsManager}
	 * @param {Element} The html element to inject into
	 * @param {Object} A options object.
	 */
	initialize: function(container, options){
		this.setOptions(options);
		this.container = container;
		this.nav = this.createMenu();
		container.grab(this.nav);
	},
	
	/**
	 * Create the HTML for the settings manager
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {Element} The HTML for the settingsmanager.
	 */
	createMenu: function(){
		var nav = new Element('nav', {
			'class': 'nm-menu'
		});
		
		var trigger = new Element('div', {
			'class': 'nm-trigger',
			html: '<span class="nm-icon nm-icon-menu"></span><a class="nm-label">Settings</a>',
			events: {
				click: this.toggle.bind(this)
			}
		});
		
		var menu = this.menu = new Element('ul');
		
		menu.grab(new Element('ul', {
			'class': 'nm-object-properties',
			id: 'nm-edit-content'	
		}));
		
		var menuButtons = this.menuButtons = new Element('li', {
			class: 'clearfix nm-menu-buttons', 
		});

		var saveButton = new Element('button', {
			text: 'Save',
			class: 'btn btn-primary pull-right',
			events: {
				click: this.save.bind(this)
			}
		});
		
		menu.grab(menuButtons.grab(saveButton));

		nav.grab(trigger);
		nav.grab(menu);
		
		return nav;
	},

	/**
	 * Returns the content container. This container is
	 * used when custom html should be injected.
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {Element} The content conainer
	 */
	getContentContainer: function(){
		return this.nav.getElement('#nm-edit-content');
	},

	/**
	 * By calling this function and sending in the 
	 * object that shold be edited the settingsManager
	 * will setup the UI. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	edit: function(obj){
		this.editing = obj;
		var editables;
		var link = {};		
		
			
		var content = this.getContentContainer();
		this.clear();
		this.displayButtons();
		
		// Check if the object is a link
		if (obj.getLink){
			link = obj.getLink();
			this.fireEvent('edit', [link]);
			content.grab(link.getSettingsWidget());
			return this;			
		}
	
		// This is for other types of nodes.
		content.grab(obj.getSettingsWidget());		
		
		this.fireEvent('edit', [obj]);
		
		return this;
	},

	/**
	 * Clears the content container.
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	clear: function(){
		this.getContentContainer().empty();

		return this;
	},
	
	/**
	 * Hides the normal menu buttons. The callback
	 * will be called before they are set into visable
	 * state. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	hideButtons: function(callback){
		
		this.menuButtons.setStyle('display', 'none');
		this.showButtonsCallback = (callback) ? callback : function(){};
		
		return this;	
	},

	/**
	 * Hides the normal menu buttons. The callback
	 * will be called before they are set into visable
	 * state. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	displayButtons: function(){
		if (!this.showButtonsCallback){
			return this;
		}
			
		this.showButtonsCallback();
		delete this.showButtonsCallback;
		
		this.menuButtons.setStyle('display', 'block');
		
		return this;
	},

	/**
	 * Toggle the settings manager. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	toggle: function(){
		if (this.nav.hasClass('nm-menu-open')){
			return this.disable();
		}
		else {
			return this.enable();
		}
	},
	

	/**
	 * Enable the settings manager. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	enable: function(){
		this.nav.addClass('nm-menu-open');	
		this.fireEvent('active');

		return this;
	},
	

	/**
	 * Disable the settings manager. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	disable: function(){
		this.nav.removeClass('nm-menu-open');
		this.nav.getElement('#nm-edit-content').empty();
		this.fireEvent('deactive');

		return this;
	},
	

	/**
	 * This triggers a save event.
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	save: function(){
		this.fireEvent('save');

		return this;
	}

});
;
networkMap.Graph = new Class({
	Implements: [Options, Events],

	/** The default options*/
	options:{
		/** The with of the graph */
		width: 10,
		/** The height of the graph */
		height: 10,
		/** The name of the datasoruce to use */
		datasource: 'simulate',
		/** The name of the colormap to use */
		colormap: 'flat5',
		/** Controls of the settings manager is created */
		enableEditor: true,
		/** Controls if the nodes are draggable */
		allowDraggableNodes: false,
		/** Controlls how often the links refresh the data */
		refreshInterval: null
	},

	/** This array controls what is exported in getConfiguration*/
	exportedOptions: [
		//'width',
		//'height'
	],

	/** An internal array of nodes, do not use directly */
	nodes: [],

	/** An internal array of links, do not use directly */
	links: [],

	/** An internal reference to onSave configuration */
	saveData: {},

	/**
	 * Creates an instance of networkMap.Graph.
	 *
	 * @constructor
	 * @this {networkMap.Graph}
	 * @param {string|element} A string or Element to attach to network graph to
	 * @param {Object} A options object.
	 */
	initialize: function(target, options){
		this.setOptions(options);
		this.element = document.id(target);
		this.container = new Element('div', {'class': 'nm-container'});
		this.element.grab(this.container);

		this.svg = SVG(this.container);
		this.graph = this.svg.group();
		
		if (this.options.enableEditor){
			this.legend = new networkMap.ColorLegend(this.options.colormap, {graph: this});
		}

		this.settings = new networkMap.SettingsManager(this.container);
		this.settings.addEvent('active', this.enableEditor.bind(this));
		this.settings.addEvent('deactive', this.disableEditor.bind(this));
		this.settings.addEvent('save', this.save.bind(this));
		
		this.addEvent('resize', this.rescale.bind(this));
		this.triggerEvent('resize', this);
		
		this.setRefreshInterval(this.options.refreshInterval);
		
	},

	/** 
	 * Set the intervall which the graph should refresh
	 *
	 * @param interval {int} interval in seconds. If null it 
	 * will disable the updates.  
	 * @return {networkMap.Graph} self
	 */
	setRefreshInterval: function(interval){
		this.options.interval = interval;
		
		if (interval){
			this.intervalId = setInterval(function(){
				this.refresh();
			}.bind(this), interval*1000);
		}
		else if (this.intervalId){
			clearInterval(this.intervalId);
			delete this.intervalId;
		}
		return this;
	},

	/**
	 * Trigger an event in an object
	 * @param event {string} The event name to trigger 
	 * @param object {object} The object to trigger the event on
	 * 
	 * @return {networkMap.Graph} self
	 * @todo Move to a statical function
	 */
	triggerEvent: function(event, object){
		object.fireEvent(event, object);

		return this;
	},

	/**
	 * This will rescale the SVG element, and if it 
	 * does not fit it will will zoom out.
	 *
	 * @ retrun {networkMap.Graph} self
	 */
	rescale: function(){
		var docSize = this.element.getSize();	
		
		var bbox = this.svg.bbox();		
		
		// scale the svg if the docsize is to small
		if (docSize.x < (bbox.width + bbox.x) || docSize.y < (bbox.height + bbox.y)){
			this.svg.viewbox(0,0,bbox.width + bbox.x, bbox.height + bbox.y);
		}
		else{
			this.svg.viewbox(0, 0, docSize.x, docSize.y);
		}
		
		this.svg.size(
			docSize.x, 
			docSize.y
		);
		
		return this;		
	},

	/**
	 * Returns the root SVG object
	 *
	 * @ retrun {SVG}
	 */
	getSVG: function(){
		return this.svg;
	},

	/**
	 * Returns the main SVG group used for painting the graph
	 *
	 * @ retrun {SVG.Group}
	 */
	getPaintArea: function(){
		return this.graph;
	},

	/**
	 * Returns the settingsManager that is bound to the graph
	 *
	 * @ retrun {networkMap.SettingsManager}
	 */
	settingsManager: function(){
		return this.settings();
	},

	/**
	 * Load a network map, it can either be a URI string
	 * or an configuration object.
	 *
	 * @param {string|object} The thing to load
	 * @retrun {networkMap.Graph} self
	 * @throws "TypeError"
	 */
	load: function(obj){
		if (typeOf(obj) === 'string'){
			return this.loadUrl(obj);
		}
		else if (typeOf(obj) === 'object'){
			return this.loadObject(obj);
		}
		else{
			throw new TypeError('Unknown type ' + typeOf(obj));
		}
		return this;
	},

	/**
	 * Loads a JSON file from the URL and builds a 
	 * network map.
	 *
	 * @param {string} The URL to the JSON file
	 * @ retrun {networkMap.Graph} self
	 */
	loadUrl: function(url){
		new Request.JSON({
			url: url,
			onSuccess: function(responce){
				this.loadObject(responce);
			}.bind(this),
			onFailure: function(){
				
			},
			onComplete: function(){
				
			},
			onError: function(text, error){
				
			}
		}).get({});

		return this;
	},

	/**
	 * Load an object representation of a network map.
	 *
	 * @param {Object} The Object representation of the mao
	 * @ retrun {networkMap.Graph} self
	 */
	loadObject: function(mapStruct){
		mapStruct.nodes.each(function(node){
			node.graph = this;
			node.draggable = this.options.allowDraggableNodes;
			this.addNode(new networkMap.Node(node));
		}.bind(this));

		mapStruct.links.each(function(link){
			link.graph = this;
			this.addLink(new networkMap.Link(link));
		}.bind(this));

		this.setOnSave(mapStruct.onSave);
		
		this.fireEvent('load', [this]);

		return this;
	},

	/**
	 * This will set the configuration that controlls
	 * the save call. See documentation for onSave in
	 * the configuration file documentation for more 
	 * information.
	 *
	 * @param {Object} The onŚave configuration
	 * @ retrun {networkMap.Graph} self
	 */
	setOnSave: function(saveData){
		if (saveData){
			if (this.validateSave(saveData))
				this.saveData = saveData;
		}
		return this;
	},

	/**
	 * Retreive the configuration object for the save
	 * call. See documentation for onSave in the 
	 * configuration file documentation for more 
	 * information.
	 *
	 *
	 * @ retrun {Object} The onSave configuration.
	 */
	getOnSave: function(){
		return (this.saveData) ? this.saveData : {};
	},

	
	/**
	 * Validate a onSave configuration object. Returns
	 * true if it validates, false otherwise.
	 * structure:
	 * "onSave": {
	 *  "method": "post|get",
	 *  "url": "update.php",
	 *  "data": {
	 *   "id": "weathermap.json"		
	 *  }
	 * }
	 *
	 * @ retrun {boolean} The onSave configuration.
	 */
	validateSave: function(save){
		if (save.method && !(save.method == 'post' || save.method == 'get')){
			this.saveEnabled = false;
			alert("Illigal argument: " + save.method + ". Valid onSave.method arguments are: post, get"); 
			return false;
		}
		else{
			save.method = "post";	
		}
				
		save.data = save.data || {};
		
		if (!save.url){
			this.saveEnabled = false;
			alert("Missing argument onSave.url");	
			return false;
		}
		
		return true;		
	},

	/**
	 * Send a save request to the server.
	 *
	 * @ retrun {boolean} If request could be sent
	 * @todo Emit event when save is compleated
	 */
	save: function(){
		if (!this.saveData)
			return false;
			
		var data = this.getConfiguration();
		 
		new Request.JSON({
			url: this.saveData.url,
			method: this.saveData.method,
			'data': data,
			onSuccess: function(response){
				console.log(response);
			}.bind(this),
			onFailure: function(){
				
			},
			onComplete: function(){
				
			},
			onError: function(text, error){
				
			}
		}).send();
		
		return true;
	},

	/**
	 * Set nodes and links in edit mode
	 *
	 * @ retrun {networkManager.Graph} self
	 */
	enableEditor: function(){
		this.enableDraggableNodes();
		this.nodes.each(function(node){
			node.mode('edit');
		});

		this.links.each(function(link){
			link.mode('edit');
		});

		return this;
	},

	/**
	 * Disable edit mode on nodes and links.
	 *
	 */
	disableEditor: function(){
		this.disableDraggableNodes();
		
		this.nodes.each(function(node){
			node.mode('normal');
		});
		this.links.each(function(link){
			link.mode('normal');
		});

		return this;
	},

	/**
	 * Enable draggable nodes
	 *
	 * @ retrun {networkMap.Graph} self
	 */
	enableDraggableNodes: function(){
		this.nodes.each(function(node){
			node.draggable();
		});

		return this;		
	},

	/**
	 * disable draggable nodes
	 *
	 * @ retrun {networkMap.Graph} self
	 */
	disableDraggableNodes: function(){
		this.nodes.each(function(node){
			node.fixed();	
		});

		return this;
	},

	/**
	 * Fetch configuration from links and nodes
	 *
	 * @ retrun {Object} A networkmap configuration object
	 */
	getConfiguration: function(){
		var configuration = {
			nodes: [],
			links: []
		};

		// self
		this.exportedOptions.each(function(option){
			configuration[option] = this.options[option];
		}.bind(this));
		configuration.onSave = this.saveData;

		// nodes
		this.nodes.each(function(node){
			configuration.nodes.push(node.getConfiguration());
		});

		// links
		this.links.each(function(link){
			configuration.links.push(link.getConfiguration());
		});

		return configuration;
	},

	/**
	 * Add a node to the graph
	 *
	 * @param {networkMap.Node} The node to add
	 * @ retrun {networkMap.Graph} self
	 * @todo refactor to a factory method
	 */
	addNode: function(node){
		this.nodes.push(node);

		return this;
	},

	/**
	 * Get the node with ID = id, returns undefined 
	 * if the node does not exist.
	 *
	 * @param {string} A node id
	 * @ retrun {networkMap.Node} The node or undefined
	 */
	getNode: function(id){
		return this.nodes.find(function(node){
			if (node.options.id === id){
				return true;
			}
		});
	},
	
	/**
	 * Remove a node from the graph
	 *
	 * @param {networkMap.Node} The node to remove
	 * @ retrun {networkMap.Graph} self
	 * @todo refactor so the node is removed by unseting 
	 * the graph reference in the node.
	 */
	removeNode: function(node){
		this.nodes.erase(node);
		node.setGraph(null);

		this.getLinks(node).each(function(link){
			this.removeLink(link);
		}.bind(this));		
		
		return this;
	},

	/**
	 * Add a link to the graph
	 *
	 * @param {networkMap.Link} The link to add
	 * @ retrun {networkMap.Graph} self
	 * @todo this should happen when the setting 
	 *	the graph in the link.
	 */
	addLink: function(link){
		this.links.push(link);

		return this;
	},	
	

	getLink: function(nodeIdA, nodeIdB){
		return this.links.find(function(link){
			if (link.nodeA.options.id === nodeIdA && link.nodeB.options.id === nodeIdB){
				return true;
			}
			if (link.nodeA.options.id === nodeIdB && link.nodeB.options.id === nodeIdA){
				return true;
			}

		});
	},

	getLinks: function(node, secondaryNode){
		var links = [];		
		
		this.links.each(function(link){
			if (link.connectedTo(node, secondaryNode)){
				links.push(link);
			}
		});
		
		return links;
	},

	/**
	 * Remove a link from the graph
	 *
	 * @param {networkMap.Link} The link to remove
	 * @ retrun {networkMap.Graph} self
	 */
	removeLink: function(link){
		this.links.erase(link);
		link.setGraph(null);
		return this;
	},

	/**
	 * Signal links to call the datasource to refresh.
	 *
	 * @ retrun {networkMap.Graph} self
	 */
	refresh: function(){
		this.links.each(function(link){
			link.localUpdate();
		});

		return this;
	},

	/**
	 * Refresh links in batch mode. This method does not work
	 * at the moment.
	 * 
	 * @todo remove or refactor the method
	 */
	update: function(){
		var requests = {};
		this.links.each(function(link){
			[link.options.nodeA, link.options.nodeB].each(function(node){
				if (!requests[node.requestUrl])
				requests[node.requestUrl] = [];

				requests[node.requestUrl].push(node.requestData);
			});	
		});

		Object.each(requests, function(requestData, requestUrl){
			requestData.callback = function(result){
				console.log(result);
			};
			
			networkMap.datasource[this.options.datasource](
				requestUrl, 
				requestData
			);
		}.bind(this));
	}


});
;networkMap.Node = new Class({
	Implements: [Options, Events],
	options:{
		graph: null,
		id: null,
		name: null,
		x: null,
		y: null,
		lat: null,
		lng: null,
		weight: null,
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
		'events'
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
		padding: {
			label: 'Padding',
			type: 'int'
		}		
	},
	initialize: function(options){
		this.graph = options.graph;
		delete options.graph;

		this.setOptions(options);

		if (!this.options.id){
			throw "Node(create, no id given)";
		}
		
		this.options.x = parseFloat(this.options.x);
		this.options.y = parseFloat(this.options.y);
		this.options.padding = parseFloat(this.options.padding); 

		if (this.graph){
			this.draw();
		}

	},

	/* TODO: Remove
	getEditables: function(){
		return this.editTemplate;
	},
	*/

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
			configuration[option] = this.options[option];
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
				console.log('test');
				obj.setProperty(key, e.target.value);	
			};
		};
	
		accordionGroup = container.add('Globals');		
		Object.each(this.editTemplate, function(option, key){
			accordionGroup.grab(new networkMap.widget.IntegerInput(option.label, this.getProperty(key), option).addEvent('change', changeHandler(key, this)));
		}.bind(this));
		
		return container;
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
		this.svg.style('cursor', 'default');
		
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
				family:   'Helvetica',
				size:     16,
				anchor:   'start',
				leading:  1.2
			})
			.move(this.options.padding, this.options.padding);

		// create the rect
		var bboxLabel = label.bbox();
		var rect = svg.rect(1,1)
			.fill({ color: '#ddd'})
			.stroke({ color: '#000', width: 2 })
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
		svg.move(this.options.x, this.options.y);
		
	
		
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

networkMap.Node.renderer = networkMap.Node.renderer || {};

networkMap.registerNodeRenderer = function(name, renderer){
	networkMap.Node.renderer[name] = renderer;
};
networkMap.Node.renderer.rect = function(){};


networkMap.Node.label = networkMap.Node.label || {};
networkMap.Node.label.rederer = networkMap.Node.label.rederer || {};
networkMap.Node.label.rederer.normal = function(){};;networkMap.LinkPath = new Class ({
	Implements: [Options, Events],
	options: {},
	svg: null,
	initialize: function(link, svg, options){
		this.setOptions(options);
		this.link = link;
		this.svg = svg;
		
		// Check if we should setup an update event
		if (this.options.requestUrl) {
			this.link.registerUpdateEvent(
				link.options.datasource,
				this.options.requestUrl,
				this,
				function(response){
					this.link.updateBgColor(this, this.link.options.colormap.translate(response.value));
				}.bind(this)
			);
		}
		
		this.setupEvents();
	},
	getEditables: function(){
		var editables = {
			width: {
				label: 'Local width',
				type: 'int'	
			}	
		};
		
		return editables;		
	},
	getLink: function(){
		return this.link;
	},
	/**
	 * Get the node which is assosiated to the linkPath
	 *
	 * @retrun {networkMap.Node} The node which this is assosiated with.
	 */
	getNode: function(){
		return this.getLink().getNode(this);
	},
	getProperty: function(key){
		if (key == 'width'){
			var link = this.getMainPath();
			if (link != this){
				return link.getProperty(key);
			}
			else if (!this.options[key]){
				return this.link.options[key];
			}
		}
		
		if (!this.options[key]){
			return null;
		}
		
		return this.options[key];
	},
	setProperty: function(key, value){
		if (key == 'width'){
			var link = this.getMainPath();
			if (link != this){
				return link.setProperty(key, value);
			}
		}
				
		this.options[key] = value;
		this.fireEvent('change', [key]);
		return this;
	},
	getConfiguration: function(){
		return this.options;
	},
	getMainPath: function(){
		var link;
		
		if (this.link.subpath.nodeA){
			this.link.subpath.nodeA.each(function(sublink){
				if (this == sublink){
					link = this.link.path.nodeA;
				}
			}.bind(this));
			
			if (link){
				return link;
			}		
		}
		
		if (this.link.subpath.nodeB){
			this.link.subpath.nodeB.each(function(sublink){
				if (this == sublink){
					link = this.link.path.nodeB;
				}
			}.bind(this));
			
			if (link){
				return link;
			}		
		}
		
		return this;
		
	},
	setupEvents: function(){
		this.svg.on('click', this._clickHandler.bind(this));
		
		if (this.options.events){
			if (this.options.events.click){
				this.svg.attr('cursor', 'pointer');
			}

			if (this.options.events.hover){
				this.svg.on('mouseover', this._hoverHandler.bind(this));
				this.svg.on('mouseout', this._hoverHandler.bind(this));
			}
		}
	},
	_clickHandler: function(e){
		if (this.link.mode() === 'normal' && this.options.events && this.options.events.click){
			networkMap.events.click(e, this);
		}
		else if (this.link.mode() === 'edit'){
			this.link.graph.settings.edit(this);	
		}
	},
	_hoverHandler: function(e){
		networkMap.events.mouseover(e, this);
	}
});
;networkMap.Link = new Class({
	Implements: [Options],
	options:{
		inset: 10,
		connectionDistance: 10,
		staticConnectionDistance: 30,
		arrowHeadLength: 10,
		width: 10,
		debug: true,
		background: '#777',
		localUpdate: true,
		refreshInterval: 300000,
		datasource: null,
		colormap: null,
	},
	exportedOptions: [
		'inset',
		'connectionDistance',
		'staticConnectionDistance',
		'arrowHeadLength',
		'width',
		'background'
	],
	
	editTemplate: {
		width: {
			label: 'Width',
			type: 'int'
		},
		inset: {
			label: 'Inset',
			type: 'int'
		},
		connectionDistance: {
			label: 'Chamfer',
			type: 'int'
		},
		staticConnectionDistance: {
			label: 'Offset',
			type: 'int'
		},
		arrowHeadLength: {
			label: 'Arrow Head',
			type: 'int'
		}
	},
	pathPoints: [],
	svgEl: {},
	updateQ: {},
	_mode: 'normal',
	path: {},
	subpath: {},
	initialize: function(options){
		var link, sublink;
		
		this.graph = options.graph;
		options.graph = null;
		this.options.datasource = this.options.datasource || this.graph.options.datasource;
		this.svg = this.graph.getPaintArea().group();


		if (!options.nodeA || !options.nodeB){
			throw "Link(create, missing node in link definition)";
		}

		this.nodeA = this.graph.getNode(options.nodeA.id);
		if (!this.nodeA){
			throw "Link(create, nodeA does not exist (" + this.options.nodeA.id + ")";
		}

		link = options.nodeA;
		this.options.nodeA = link.id;

		if (link.sublinks){
			sublinks = link.sublinks;
			delete link.sublinks;
			this.subpath.nodeA = [];
			sublinks.each(function(sublink){
				this.subpath.nodeA.push(new networkMap.LinkPath(this, networkMap.path(this.svg), sublink).addEvent('change', this.redraw.bind(this)));
			}.bind(this));
		}
		this.path.nodeA = new networkMap.LinkPath(this, networkMap.path(this.svg), link).addEvent('change', this.redraw.bind(this));
			
		
		// add a holder for SVG objects
		if (this.options.nodeA.requestData || this.options.nodeA.sublinks){
			this.svgEl.nodeA = {};

			if (this.options.nodeA.sublinks){
				this.svgEl.nodeA.sublinks = [];
			}
		}

		this.nodeB = this.graph.getNode(options.nodeB.id);
		if (!this.nodeB){
			throw "Link(create, nodeB does not exist (" + this.options.nodeB.id + ")";
		}

		link = options.nodeB;
		this.options.nodeB = link.id;

		if (link.sublinks){
			sublinks = link.sublinks;
			delete link.sublinks;
			this.subpath.nodeB = [];
			sublinks.each(function(sublink){
				this.subpath.nodeB.push(new networkMap.LinkPath(this, networkMap.path(this.svg), sublink).addEvent('change', this.redraw.bind(this)));
			}.bind(this));
		}
		this.path.nodeB = new networkMap.LinkPath(this, networkMap.path(this.svg), link).addEvent('change', this.redraw.bind(this));
		

		// Add a holder for SVG objects
		if (this.options.nodeB.requestData || this.options.nodeB.sublinks){
			this.svgEl.nodeB = {};

			if (this.options.nodeB.sublinks){
				this.svgEl.nodeB.sublinks = [];
			}

		}

		this.setOptions(options);

		if (!this.options.colormap){
			this.options.colormap = networkMap.colormap[this.graph.options.colormap];
		}

		// setup datasource
		this.datasource = networkMap.datasource[this.options.datasource];


		if (this.graph){
			this.draw();
		}
	},
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
			accordionGroup.grab(new networkMap.widget.IntegerInput(option.label, this.getProperty(key), option).addEvent('change', changeHandler(key, this)));
		}.bind(this));		
		
		
		
		var linkTemplate = {
			id: {
				label: 'Node',
				type: 'text',
				disabled: true
			},
			name: {
				label: 'Interface',
				type: 'text',
				disabled: true
			}, 
			width: {
				label: 'Width',
				type: 'int'	
			}
		};		
		
		accordionGroup = container.add('Node A');
		Object.each(linkTemplate, function(option, key){
			if (['id'].some(function(item){ return item == key;})){
				accordionGroup.grab(new networkMap.widget.TextInput(option.label, this.nodeA.getProperty(key), option).addEvent('change', changeHandler(key, this.nodeA)));
			}
			else{
				if (option.type === 'int'){
					accordionGroup.grab(new networkMap.widget.IntegerInput(option.label, this.path.nodeA.getProperty(key), option).addEvent('change', changeHandler(key, this.path.nodeA)));
				}
				else if(option.type === 'text'){
					accordionGroup.grab(new networkMap.widget.TextInput(option.label, this.path.nodeA.getProperty(key), option).addEvent('change', changeHandler(key, this.path.nodeA)));
				}
			}
		}.bind(this));
			
		accordionGroup = container.add('Node B');
		Object.each(linkTemplate, function(option, key){
			if (['id'].some(function(item){ return item == key;})){
				accordionGroup.grab(new networkMap.widget.TextInput(option.label, this.nodeB.getProperty(key), option).addEvent('change', changeHandler(key, this.nodeB)));
			}
			else{
				if (option.type === 'int'){
					accordionGroup.grab(new networkMap.widget.IntegerInput(option.label, this.path.nodeB.getProperty(key), option).addEvent('change', changeHandler(key, this.path.nodeB)));
				}
				else if(option.type === 'text'){
					accordionGroup.grab(new networkMap.widget.TextInput(option.label, this.path.nodeB.getProperty(key), option).addEvent('change', changeHandler(key, this.path.nodeB)));
				}
			}
		}.bind(this));
				
		
		return container;
		
		
		
	
	},
	getEditables: function(){
		return this.editTemplate;
	},
	setProperty: function(key, value){
		if (!this.editTemplate[key]){
			throw 'Unknow id: ' + key;
		}
		
		this.options[key] = value;
		this.redraw();
	},
	getProperty: function(key){
		if (!this.editTemplate[key]){
			throw 'Unknow id: ' + key;
		}
		
		return this.options[key];
	},
	/**
	 * Get the node which is assosiated a linkPath
	 *
	 * @param {networkMap.LinkPath} linkPath 
	 * @retrun {networkMap.Node} The node which the linkPath is associated with.
	 */
	getNode: function(linkPath){
		var any = function(path){
			if (path === linkPath){
				return true;	
			}
		};
		
		if (this.path.nodeA === linkPath){
			return this.nodeA;
		}
		
		if (this.subpath.nodeA){
			if (this.subpath.nodeA.some(any, this)){
				return this.nodeA;	
			}
		}
		
		if (this.path.nodeB === linkPath){
			return this.nodeB;
		}
		
		if (this.subpath.nodeB){
			if (this.subpath.nodeB.some(any, this)){
				return this.nodeB;	
			}
		}
		
		throw "Link is not found";		
	},
	connectedTo: function(node, secondaryNode){
		if (secondaryNode){
			return (this.nodeA == node || this.nodeB == node) && (this.nodeA == secondaryNode || this.nodeB == secondaryNode);
		}
		
		return (this.nodeA == node || this.nodeB == node); 
	},
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
	getConfiguration: function(){
		var configuration = {};

		this.exportedOptions.each(function(option){
			configuration[option] = this.options[option];
		}.bind(this));

		if (this.path.nodeA){
			configuration.nodeA = this.path.nodeA.getConfiguration();			
		}		
		if (this.subpath.nodeA){
			configuration.nodeA = configuration.nodeA || {};
			configuration.nodeA.sublinks = [];
			this.subpath.nodeA.each(function(subpath){
				configuration.nodeA.sublinks.push(subpath.getConfiguration());
			});
		}
		
		if (this.path.nodeB){
			configuration.nodeB = this.path.nodeB.getConfiguration();			
		}		
		if (this.subpath.nodeB){
			configuration.nodeB = configuration.nodeB || {};
			configuration.nodeB.sublinks = [];
			this.subpath.nodeB.each(function(subpath){
				configuration.nodeB.sublinks.push(subpath.getConfiguration());
			});
		}

		
		return configuration;
	},
	setGraph: function(graph){	
		// remove the object from the graph
		this.graph = null;
		this.draw();

		// if a graph is defined draw 
		if (graph){
			this.graph = graph;
			this.draw();
		}
	},
	_cleanDebugLayer: function(){
		if (this.debug){
			this.debug.clear();
		}
		if (this.options.debug && !this.debug){
			this.debug = this.graph.getPaintArea().group();
		}
	},
	redraw: function(){
		this.redrawShadowPath();
		this.drawMainPath();
		this.drawSublinks();
		return this;
	},
	draw: function(){
		if (this.svg && !this.graph){
			this.svg.remove();
			return false;
		}

		if (!this.graph){
			return false;
		}

		this._cleanDebugLayer();

		// create a group object 
		var svg = this.svg;
		svg.back();
		
		var bboxA = this.nodeA.bbox();
		var bboxB = this.nodeB.bbox();
		this.shadowPath = svg.path().attr({ 
			fill: 'none',
			stroke: '#000', 
			'stroke-dasharray': '3,5',
			'stroke-width': 2 
		});

		this.redrawShadowPath().hideShadowPath();
		this.drawMainPath();
		this.drawSublinks();
		this.localUpdate();

		this.nodeA.addEvent('drag', function(delta, event){
			this._cleanDebugLayer();
			this.redrawShadowPath();
		}.bind(this));

		this.nodeB.addEvent('drag', function(delta, event){
			this._cleanDebugLayer();
			this.redrawShadowPath();
		}.bind(this));

		this.nodeA.addEvent('dragstart', function(event){
			this.shadowPath.show();
			this.hidePaths();
		}.bind(this));
		this.nodeB.addEvent('dragstart', function(event){
			this.shadowPath.show();
			this.hidePaths();
		}.bind(this));

		this.nodeA.addEvent('dragend', function(event){
			this.redrawShadowPath().hideShadowPath();
			this.drawMainPath();
			this.drawSublinks();
			this.showPaths();
			
		}.bind(this));
		this.nodeB.addEvent('dragend', function(event){
			this.redrawShadowPath().hideShadowPath();
			this.drawMainPath();
			this.drawSublinks();
			this.showPaths();
		}.bind(this));

	},
	redrawShadowPath: function(){
		// truncate array
		this.pathPoints.length = 0;

		var Point = networkMap.Point;

		var bboxA = this.nodeA.bbox();
		var bboxB = this.nodeB.bbox();

		var angle = SVG.math.angle(bboxA, bboxB);
		angle = SVG.math.snapToAngle(angle, [0, Math.PI/2, Math.PI, Math.PI*3/2]);// + 1.5 * Math.PI;

		// set the start possition of the shaddow path
		// INDEX: 0
		if (this.options.inset){
			this.pathPoints.push(new SVG.math.Point(
				-this.options.inset * Math.cos(angle) + bboxA.cx + Math.cos(angle) * bboxA.width / 2,
				//this.options.inset * Math.cos(angle) + bboxA.cx - Math.cos(angle) * bboxA.width / 2,
				-this.options.inset * Math.sin(angle) + bboxA.cy + Math.sin(angle) * bboxA.height / 2
			));			
		}
		else{
			this.pathPoints.push(new SVG.math.Point(bboxA.cx, bboxA.cy));
		}

		this.pathPoints.push(new SVG.math.Point(
			this.options.connectionDistance * Math.cos(angle) + bboxA.cx + Math.cos(angle) * bboxA.width / 2,
			//-this.options.connectionDistance * Math.cos(angle) + bboxA.cx - Math.cos(angle) * bboxA.width / 2,
			this.options.connectionDistance * Math.sin(angle) + bboxA.cy + Math.sin(angle) * bboxA.height / 2
		));
		

		this.pathPoints.push(new SVG.math.Point(
			this.options.staticConnectionDistance * Math.cos(angle) + bboxA.cx + Math.cos(angle) * bboxA.width / 2,
			//-this.options.staticConnectionDistance * Math.cos(angle) + bboxA.cx - Math.cos(angle) * bboxA.width / 2,
			this.options.staticConnectionDistance * Math.sin(angle) + bboxA.cy + Math.sin(angle) * bboxA.height / 2
		));

		this.pathPoints.push(new SVG.math.Point(
			-this.options.staticConnectionDistance * Math.cos(-angle) + bboxB.cx - Math.cos(-angle) * bboxB.width / 2,
			//this.options.staticConnectionDistance * Math.cos(-angle) + bboxB.cx + Math.cos(-angle) * bboxB.width / 2,
			this.options.staticConnectionDistance * Math.sin(-angle) + bboxB.cy + Math.sin(-angle) * bboxB.height / 2
		));

		this.pathPoints.push(new SVG.math.Point(
			-this.options.connectionDistance * Math.cos(-angle) + bboxB.cx - Math.cos(-angle) * bboxB.width / 2,
			//this.options.connectionDistance * Math.cos(-angle) + bboxB.cx + Math.cos(-angle) * bboxB.width / 2,
			this.options.connectionDistance * Math.sin(-angle) + bboxB.cy + Math.sin(-angle) * bboxB.height / 2
		));

		if (this.options.inset){
			this.pathPoints.push(new SVG.math.Point(
				//-this.options.inset * Math.cos(-angle) + bboxB.cx + Math.cos(-angle) * bboxB.width / 2,
				this.options.inset * Math.cos(-angle) + bboxB.cx - Math.cos(-angle) * bboxB.width / 2,
				-this.options.inset * Math.sin(-angle) + bboxB.cy + Math.sin(-angle) * bboxB.height / 2
			));
		}
		else {
			this.pathPoints.push(new SVG.math.Point(bboxB.cx, bboxB.cy));
		}


		this.shadowPath
			.clear()
			.M(this.pathPoints[0])
			.L(this.pathPoints[2])
			.L(this.pathPoints[3])
			.L(this.pathPoints[5]);

		return this;
	},
	removeMainPath: function(){
		if (this.mainPathA)
			this.mainPathA.remove();

		if(this.mainPathB)
			this.mainPathB.remove();
	},
	hidePaths: function(){
		if (this.path.nodeA){
			this.path.nodeA.svg.hide();
		}
		if (this.subpath.nodeA){
			this.subpath.nodeA.each(function(subpath){
					subpath.svg.hide();
			});
		}
		if (this.path.nodeB){
			this.path.nodeB.svg.hide();
		}
		if (this.subpath.nodeB){
			this.subpath.nodeB.each(function(subpath){
					subpath.svg.hide();
			});
		}

		return this;
	},
	showPaths: function(){
		if (this.path.nodeA){
			this.path.nodeA.svg.show();
		}
		if (this.subpath.nodeA){
			this.subpath.nodeA.each(function(subpath){
					subpath.svg.show();
			});
		}
		if (this.path.nodeB){
			this.path.nodeB.svg.show();
		}
		if (this.subpath.nodeB){
			this.subpath.nodeB.each(function(subpath){
					subpath.svg.show();
			});
		}

		return this;
	},
	showShadowPath: function(){
		this.shadowPath.show();
		return this;
	},
	hideShadowPath: function(){
		this.shadowPath.hide();
		return this;
	},
	drawMainPath: function(){
		var maxLinkCount = 1;
		
		var drawNormalPath = function(sublink, pathPoints, options){
			var width = sublink.getProperty('width');
			var firstSegment = new SVG.math.Line(pathPoints[0], pathPoints[2]);
			var midSegment = new SVG.math.Line(pathPoints[2], pathPoints[3]);
	
			// perpendicular line with last point in firstList
			var helpLine1 = firstSegment.perpendicularLine(pathPoints[1], maxLinkCount * width);
			var helpLine2 = firstSegment.perpendicularLine(pathPoints[2], maxLinkCount * width);
			var helpLine3 = midSegment.perpendicularLine(pathPoints[2], maxLinkCount * width);
			
			var midPoint = midSegment.midPoint();
			var helpPoint1 = midSegment.move(midPoint, midSegment.p1, sublink.link.options.arrowHeadLength);
			var helpPoint2 = midSegment.move(midPoint, midSegment.p2, sublink.link.options.arrowHeadLength);
			
			var helpLine4 = midSegment.perpendicularLine(helpPoint1, maxLinkCount * width);
	
			// find intersection point 1
			var helpLine5 = new SVG.math.Line(helpLine1.p1, helpLine2.p1);
			var helpLine6 = new SVG.math.Line(helpLine3.p1, helpLine4.p1);
			var intersectPoint1 = helpLine6.intersection(helpLine5);
	
			if (intersectPoint1.parallel === true){
				intersectPoint1 = helpLine1.p1;
			}
	
			// find intersection point 2
			helpLine5 = new SVG.math.Line(helpLine1.p2, helpLine2.p2);
			helpLine6 = new SVG.math.Line(helpLine3.p2, helpLine4.p2);
			var intersectPoint2 = helpLine6.intersection(helpLine5);
	
			if (intersectPoint2.parallel === true){
				intersectPoint2 = helpLine1.p2;
			}
			
			sublink.svg.clear();
			
			sublink.svg
				.M(pathPoints[0])
				.L(helpLine1.p1).L(intersectPoint1).L(helpLine4.p1)
				.L(midPoint)
				.L(helpLine4.p2).L(intersectPoint2).L(helpLine1.p2)
				.Z().front();
		
		};
		
		var drawBondPath = function(sublink, pathPoints, linkCount){
			var width = sublink.getProperty('width');
			var midSegment = new SVG.math.Line(pathPoints[2], pathPoints[3]);
	
			var midPoint = midSegment.midPoint();
			var helpPoint1 = midSegment.move(midPoint, midSegment.p1, sublink.link.options.arrowHeadLength);
			
			var helpLine4 = midSegment.perpendicularLine(helpPoint1, linkCount * width / 2);
			
			var startPoint = new SVG.math.Line(pathPoints[2], midPoint).midPoint();
			var helpLine7 = midSegment.perpendicularLine(
				startPoint, 
				linkCount * width / 2
			);
	
		
			
			sublink.svg.clear();
			
			sublink.svg
				.M(startPoint)
				.L(helpLine7.p1).L(helpLine4.p1)
				.L(midPoint)
				.L(helpLine4.p2).L(helpLine7.p2)
				.Z().front();
		};
		
		var drawSinglePath = function(){
			
		};
		
		var drawSingleBondPath = function(){
			
		};

		
		
		var path;
		
				
		if (this.options.nodeA.requestUrl){
			path = [
				this.pathPoints[0],
				this.pathPoints[1],
				this.pathPoints[2],
				this.pathPoints[3]
			];

			if (this.subpath.nodeA){
				if (this.options.nodeB.requestUrl || this.subpath.nodeB){
					drawBondPath(this.path.nodeA, path, this.subpath.nodeA.length);
				}
				else {
					drawSingleBondPath();
				}
			}
			else{
				if (this.options.nodeB.requestUrl || this.subpath.nodeB){
					drawNormalPath(this.path.nodeA, path);
				}
				else {
					drawSinglePath();	
				}
			}
		}
		
		if (this.options.nodeB.requestUrl){
			path = [
				this.pathPoints[5],
				this.pathPoints[4],
				this.pathPoints[3],
				this.pathPoints[2]
			];
			
			if (this.subpath.nodeB){
				if (this.options.nodeA.requestUrl || this.subpath.nodeA){
					drawBondPath(this.path.nodeB, path, this.subpath.nodeB.length);
				}
				else {
					drawSingleBondPath();
				}
			}
			else {
				if (this.options.nodeA.requestUrl || this.subpath.nodeA){
					drawNormalPath(this.path.nodeB, path);
				}
				else {
					drawSinglePath();	
				}
			}
		}
		
		return this;
	},
	drawArc: function(){
		
	},
	drawSublinks: function(){
		var maxLinkCount, lastSegment, offset, path, width;
		
		var draw = function(sublink, node, startPoint, path){
			var index = 0;

			var updateColor = function(self, path){
				return function(response){
					this.updateBgColor(path, this.options.colormap.translate(response.value));
				}.bind(self);
			};
			
			while (offset >= -maxLinkCount / 2){
				var options = {
					width: width,
					linkCount: maxLinkCount
				};
				

				var currentSegment = this.calculateSublinkPath(path, offset, options);

				if (lastSegment){
					
					sublink[index].svg.clear();

					// Special case when we are ploting a odd number
					// of sublinks. We must add the middlepoint manually
					if (offset === -0.5){
						sublink[index].svg
							.M(startPoint)
							.L(lastSegment[0]).L(lastSegment[1]).L(lastSegment[2])
							.L(path[path.length - 1])
							.L(currentSegment[2]).L(currentSegment[1]).L(currentSegment[0])
							.Z().back();
					}
					else{
						sublink[index].svg
							.M(startPoint)
							.L(lastSegment[0]).L(lastSegment[1]).L(lastSegment[2])
							.L(currentSegment[2]).L(currentSegment[1]).L(currentSegment[0])
							.Z().back();
					}

					if (sublink[index].getProperty('events')){
						// removed due to new event system
						//sublink[index].link = nodeOptions.sublinks[sublink].events;
							
						if (sublink[index].getProperty('events').click){
							sublink[index].svg.on('click', networkMap.events.click);
							sublink[index].svg.attr('cursor', 'pointer');
						}
						if (sublink[index].getProperty('events').hover){
							sublink[index].svg.on('mouseover', networkMap.events.mouseover);
							sublink[index].svg.on('mouseout', networkMap.events.mouseout);
						}
					}
		
					index += 1;
				}
				lastSegment = currentSegment;
				offset -= 1;
			}
		}.bind(this);

		if (this.subpath.nodeA){
			maxLinkCount = this.subpath.nodeA.length;
			lastSegment = null;
			offset = maxLinkCount / 2;
			path = [
				this.pathPoints[0],
				this.pathPoints[1],
				this.pathPoints[2],
				new SVG.math.Line(this.pathPoints[2], this.pathPoints[3]).midPoint()
			];
			width = this.path.nodeA.getProperty('width') || this.options.width;
			draw(this.subpath.nodeA, this.subpath.nodeA, this.pathPoints[0], path);
		}
		if (this.subpath.nodeB){
			maxLinkCount = this.subpath.nodeB.length;
			lastSegment = null;
			offset = maxLinkCount / 2;
			path = [
				this.pathPoints[5],
				this.pathPoints[4],
				this.pathPoints[3],
				new SVG.math.Line(this.pathPoints[3], this.pathPoints[2]).midPoint()
			];
			width = this.path.nodeB.getProperty('width') || this.options.width;
			draw(this.subpath.nodeB, this.subpath.nodeB, this.pathPoints[5], path);
		}

		return this;
	},
	calculateSublinkPath: function(path, offset, options){
		var localWidth = options.width || this.options.width;
		var width = localWidth * offset;
		var angle = Math.atan2(this.options.arrowHeadLength, Math.abs(localWidth * options.linkCount / 2));
		var arrowHeadLength = Math.abs(width * Math.tan(angle)); 

		var firstSegment = new SVG.math.Line(path[0], path[2]);
		var midSegment = new SVG.math.Line(path[2], path[3]);

		// perpendicular line with last point in firstList
		var helpLine1 = firstSegment.perpendicularLine(path[1], width);
		var helpLine2 = firstSegment.perpendicularLine(path[2], width);
		var helpLine3 = midSegment.perpendicularLine(path[2], width);

		// find the arrowhead distance
		var arrowHeadInset = midSegment.move(midSegment.p2, midSegment.p1, arrowHeadLength);
		var arrowHeadStart = midSegment.perpendicularLine(arrowHeadInset, width);

		// find intersection point 1
		var helpLine5 = new SVG.math.Line(helpLine1.p1, helpLine2.p1);
		var helpLine6 = new SVG.math.Line(helpLine3.p1, arrowHeadStart.p1);
		var intersectPoint1 = helpLine6.intersection(helpLine5);

		if (intersectPoint1.parallel === true){
			intersectPoint1 = helpLine1.p1;
		}

		return [
			helpLine1.round(2).p1,
			intersectPoint1.round(2),
			arrowHeadStart.round(2).p1
		];
	},
	
	setInterval: function(){
		this.intervalId = setInterval(function(){
			this.localUpdate();
		}.bind(this), this.options.refreshInterval);
	},
	
	clearInterval: function(){
		if (this.intervalId){
			clearInterval(this.intervalId);
			delete this.intervalId;
		}

		return this;
	},

	registerUpdateEvent: function(datasource, url, link, callback){
		if (!this.updateQ[datasource]){
			this.updateQ[datasource] = {};
		}

		if (!this.updateQ[datasource][url]){
			this.updateQ[datasource][url] = [];
		}

		this.updateQ[datasource][url].push({
			link: link,
			callback: callback
		});
	},

	localUpdate: function(){
		Object.each(this.updateQ, function(urls, datasource){
			if (!networkMap.datasource[datasource]){
				throw 'Unknown datasource (' + datasource + ')';
			}
			Object.each(urls, function(requests, url){
				if (this.options.batchUpdate){
					networkMap.datasource[datasource](url, requests);
				}
				else{
					requests.each(function(request){
						networkMap.datasource[datasource](url, request);
					});
				}
			}.bind(this));
		}.bind(this));
	},

	/**
	* Function that updates the color of the paths
	* This is a draft function that does not work
	* with the current version. Use localUpdate
	* instead.
	*/
	update: function(){
		if (this.svgEl.nodeA.mainPath){
			this.datasource(
				this.options.nodeA.requestUrl, 
				this.options.nodeA.requestData, 
				function(response){
					this.updateBgColor(this.svgEl.nodeA.mainPath, this.options.colormap.translate(response.value));
				}.bind(this)
			);			
		}

		if (this.svgEl.nodeA.mainPath){
			this.datasource(
				this.options.nodeB.requestUrl, 
				this.options.nodeB.requestData, 
				function(response){
					this.updateBgColor(this.svgEl.nodeB.mainPath, this.options.colormap.translate(response.value));
				}.bind(this)
			);
		}

		if (this.options.nodeA.sublinks){
			this.options.nodeA.sublinks.each(function(sublink, index){
				this.datasource(
					this.options.nodeA.sublinks[index].requestUrl, 
					this.options.nodeA.sublinks[index].requestData, 
					function(response){
						this.updateBgColor(this.svgEl.nodeA.sublinks[index], this.options.colormap.translate(response.value));
					}.bind(this)
				);
			}.bind(this));
		}

		if (this.options.nodeB.sublinks){
			this.options.nodeB.sublinks.each(function(sublink, index){
				this.datasource(
					this.options.nodeB.sublinks[index].requestUrl, 
					this.options.nodeB.sublinks[index].requestData, 
					function(response){
						this.updateBgColor(this.svgEl.nodeB.sublinks[index], this.options.colormap.translate(response.value));
					}.bind(this)
				);
			}.bind(this));
		}

		return this;
	},
	updateBgColor: function(path, color){
		if (!color){
			path.svg.fill(this.options.background);
		}
		else{
			path.svg.fill(color);
		}
	}


});
