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
	add: function(label){
		var item = new Element ('div', {
			class: 'nm-accordion-group nm-accordion-open'	
		});
		
		var trigger = new Element('div', {
			class: 'nm-accordion-trigger',
			text: label
		});
		
		var list = new Element('ul', {
			class: 'nm-accordion-inner'	
		});
		
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


networkMap.registerColormap = function(name, colormap){
	networkMap.colormap[name] = colormap;
};

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
;networkMap.ColorLegend = new Class({
	Implements: [Options],
	options: {
		boxSize: 25,
		margin: 10

	},
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
	},
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
	initialize: function(container){
		this.container = container;
		this.nav = this.createMenu();
		container.grab(this.nav);
	},
	
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
		
		var menu = new Element('ul');
		
		menu.grab(new Element('ul', {
			'class': 'nm-object-properties',
			id: 'nm-edit-content'	
		}));
		
		menu.grab(new Element('li', {
			html: '<button class="btn btn-primary pull-right">Save</button>',
			'class': 'clearfix nm-menu-buttons', 
			events: {
				click: this.save.bind(this)
			}
		}));

		nav.grab(trigger);
		nav.grab(menu);
		
		return nav;
	},
	edit: function(obj){
		this.editing = obj;
		var editables;
		var link = {};		
		
			
		var content = this.nav.getElement('#nm-edit-content');
		content.empty();
	
		// Check if the object is a link
		if (obj.getLink){
			link = obj.getLink();
			content.grab(link.getSettingsWidget());
			return this;			
		}
	
		// This is for other types of nodes.
		content.grab(obj.getSettingsWidget());		
		
	
		
		return this;
	},
	
	toggle: function(){
		if (this.nav.hasClass('nm-menu-open')){
			this.disable();
		}
		else {
			this.enable();
		}
	},
	
	enable: function(){
		this.nav.addClass('nm-menu-open');	
		this.fireEvent('active');
	},
	
	disable: function(){
		this.nav.removeClass('nm-menu-open');
		this.nav.getElement('#nm-edit-content').empty();
		this.fireEvent('deactive');
	},
	
	save: function(){
		this.fireEvent('save');
	}

});
;
networkMap.Graph = new Class({
	Implements: [Options, Events],
	options:{
		width: 10,
		height: 10,
		datasource: 'simulate',
		colormap: 'rasta5',
		enableEditor: true,
		allowDraggableNodes: false,
		refreshInterval: null
	},
	exportedOptions: [
		//'width',
		//'height'
	],
	nodes: [],
	links: [],
	saveData: {},
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
	/*** setRefreshInterval(interval)
	* @var interval (int) interval in seconds. If null it 
	* will disable the updates.  
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
	triggerEvent: function(event, object){
		object.fireEvent(event, object);
	},
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
	getSVG: function(){
		return this.svg;
	},
	getPaintArea: function(){
		return this.graph;
	},
	load: function(obj){
		if (typeOf(obj) === 'string'){
			return this.loadUrl(obj);
		}
	},
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

		if (mapStruct.onSave){
			if (this.validateSave(mapStruct.onSave))
				this.saveData = mapStruct.onSave;
		}

		return this;
	},
	/** structure
	* "onSave": {
	*  "method": "post",
	*  "url": "update.php",
	*  "data": {
	*   "id": "weathermap.json"		
	*  }
	* }
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
	save: function(){
		if (!this.saveData)
			return false;
			
		var data = this.getConfiguration();
		data.onSave = this.saveData;
		console.log(data);

		 
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
		 
	},
	enableEditor: function(){
		this.enableDraggableNodes();
		this.nodes.each(function(node){
			node.mode('edit');
		});

		this.links.each(function(link){
			link.mode('edit');
		});
	},
	disableEditor: function(){
		this.disableDraggableNodes();
		
		this.nodes.each(function(node){
			node.mode('normal');
		});
		this.links.each(function(link){
			link.mode('normal');
		});
	},
	enableDraggableNodes: function(){
		this.nodes.each(function(node){
			node.draggable();
		});
	},
	disableDraggableNodes: function(){
		this.nodes.each(function(node){
			node.fixed();	
		});
	},
	getConfiguration: function(){
		var configuration = {
			nodes: [],
			links: []
		};

		this.exportedOptions.each(function(option){
			configuration[option] = this.options[option];
		}.bind(this));

		this.nodes.each(function(node){
			configuration.nodes.push(node.getConfiguration());
		});

		this.links.each(function(link){
			configuration.links.push(link.getConfiguration());
		});

		return configuration;
	},
	/** DEPRICATED */
	addNode: function(node){
		this.nodes.push(node);

		return this;
	},

	getNode: function(id){
		return this.nodes.find(function(node){
			if (node.options.id === id){
				return true;
			}
		});
	},


	addLink: function(link){
		this.links.push(link);

		return this;
	},

	// signal to links to refresh 
	refresh: function(){
		this.links.each(function(link){
			link.localUpdate();
		});
	},

	// Refresh all links at the same time
	// This function is not in a usable state at the moment.
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
	getEditables: function(){
		return this.editTemplate;
	},
	setProperty: function(key, value){
		if (!this.editTemplate[key]){
			throw 'Unknow id: ' + key;
		}
		
		this.options[key] = value;
		this.draw();
		
		return this;
	},
	getProperty: function(key){
		if (!this.editTemplate[key]){
			throw 'Unknown id: ' + key;
		}
		
		return this.options[key];
	},
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
	},
	_clickhandler: function(e){
		if (this._mode === 'normal' && this.options.events.click){
			networkMap.events.click(e).bind(this);
		}
		else if (this._mode === 'edit'){
			this.graph.settings.edit(this);	
		}
	},	
	x: function(){
		return this.svg.bbox().x;
	},
	
	y: function(){
		return this.svg.bbox().y;
	},
	draggable: function(){
		this._draggable = true;
		this.svg.draggable();
		this.svg.style('cursor', 'move');

	},	
	fixed: function(){
		this._draggable = false;
		this.svg.fixed();
		this.svg.style('cursor', 'default');
	},
	isDraggable: function(){
		return this._draggable;
	},
	bbox: function(){
		return this.svg.bbox();
	},
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
		
		this.link.registerUpdateEvent(
			link.options.datasource,
			this.options.requestUrl,
			this,
			function(response){
				this.link.updateBgColor(this, this.link.options.colormap.translate(response.value));
			}.bind(this)
		);
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
		colormap: networkMap.colormap.rasta5
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
				console.log('test');
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
		if (this.options.nodeA.requestUrl && this.options.nodeB.requestUrl){
			if (this.subpath.nodeA){
				path = [
					this.pathPoints[0],
					this.pathPoints[1],
					this.pathPoints[2],
					this.pathPoints[3]
				];
				drawBondPath(this.path.nodeA, path, this.subpath.nodeA.length);	
			}
			else{
				path = [
					this.pathPoints[0],
					this.pathPoints[1],
					this.pathPoints[2],
					this.pathPoints[3]
				];
				drawNormalPath(
					this.path.nodeA,
					path 
				);	
			}
			
			if (this.subpath.nodeB){
				path = [
					this.pathPoints[5],
					this.pathPoints[4],
					this.pathPoints[3],
					this.pathPoints[2]
				];
				drawBondPath(this.path.nodeB, path, this.subpath.nodeB.length);	
			}
			else {
				path = [
					this.pathPoints[5],
					this.pathPoints[4],
					this.pathPoints[3],
					this.pathPoints[2]
				];
				drawNormalPath(
					this.path.nodeB,
					path 
				);	
			}
		}
		else if (this.options.nodeA.requestUrl && !this.options.nodeB.requestUrl){
			if (this.subpath.nodeA){
				drawSinglePath();	
			}
			else{
				drawSingleBondPath();	
			}
		}
		else if (this.options.nodeB.requestUrl && !this.options.nodeA.requestUrl){
			if (this.subpath.nodeA){
				drawSinglePath();	
			}
			else{
				drawSingleBondPath();	
			}
		}
		
		return this;
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
