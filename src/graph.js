/**
 * Creates an instance of networkMap.Graph.
 *
 * @constructor
 * @this {networkMap.Graph}
 * @param {string|element} A string or Element to attach to network graph to
 * @param {Object} A options object.
 */
networkMap.Graph = function(target, options){
	/** The default options*/
	var defaults = {
		/** The with of the graph */
		width: 10,
		
		/** The height of the graph */
		height: 10,
		
		/** The name of the datasoruce to use */
		datasource: undefined,		
		
		/** The name of the colormap to use */
		colormap: undefined,
		
		/** Controls of the settings manager is created */
		enableEditor: true,
		
		/** Controls if the nodes are draggable */
		allowDraggableNodes: undefined,
		
		/** Controlls how often the links refresh the data */
		refreshInterval: 300,
		
		/** Controls if the link update should be controlled 
		 * by the graph or the link */ 
		batchUpdate: true,

		/** Controls if the grid is enabled */
		gridEnabled: true,		
		
		/** A grid size for objects to snap to */
		grid: {x:10, y:10},
		
		/** utilization labels */
		utilizationLabels: {
			enabled: false,
			fontSize: 8,
			padding: 2
		}
	};
	/* TODO: Remove
	node: {
			linkGenerator: null
		},
		link: {
			linkGenerator: null
		}
	*/
	
	/** The default configuration */
	this.defaults = {};
	

	/** This array controls what is exported in getConfiguration*/
	this.exportedOptions = [
		//'width',
		//'height'
	];

	/** An internal array of nodes, do not use directly */
	this.nodes = [];

	/** An internal array of links, do not use directly */
	this.links = [];

	/** An internal reference to onSave configuration */
	this.saveData = {};

	/** An internal reference to check keep track of the mode */
	this._mode = 'normal';


	// Setup link generator for node
	this.node = this.node || {};
	if (options.node && options.node.linkGenerator){
		this.node.linkGenerator = networkMap.Node.createLinkGenerator(this.options.node.linkGenerator);
		delete options.node;
	} else{
		this.node.linkGenerator = networkMap.Node._linkGenerator;		
	}
	
	// setup link generator for link
	this.link = this.link || {};
	if (options.link && options.link.linkGenerator){
		this.link.linkGenerator = networkMap.Link.createLinkGenerator(this.options.link.linkGenerator);
		delete options.link;
	} else{
		this.link.linkGenerator = networkMap.Link._linkGenerator;		
	}

	this.properties = new networkMap.Properties(options, new networkMap.Properties(defaults));
	this.properties.addEvent('change', function(change){
		var gridChange = false;		
		var self = this;
		change.forEach(function(prop){
			if (prop.key === 'gridEnabled') gridChange = true;
			if (prop.key === 'grid') gridChange = true;
			if (prop.key === 'utilizationLabels') self.onUtilizationLabelsChange();
		});
		if (gridChange) this.onGridChange();
		self = null;				
	}.bind(this));
		
	// Setup node and link defaults
	this.defaults.node = new networkMap.Properties({}, networkMap.Node.defaults);
	this.defaults.link = new networkMap.Properties({}, networkMap.Link.defaults);
	this.defaults.link.set('colormap', this.properties.get('colormap'));
	this.defaults.link.set('datasource', this.properties.get('datasource'));

	// Create HTML
	this.element = (typeof target == 'string' || target instanceof String) ? document.getElementById(target) : target;
	this.container = document.createElement('div');
	this.container.classList.add('nm-container');
	this.element.appendChild(this.container);

	// create SVG
	this.svg = SVG(this.container);
	this.graph = this.svg.group();
	
	// Create legend
	this.legend = new networkMap.ColorLegend(this.defaults.link.get('colormap'), {graph: this, target: this.container});

	// Enable editor, this should be move to a separate function.
	if (this.properties.get('enableEditor')){
		this.settings = new networkMap.SettingsManager(this.container, this, new networkMap.event.Configuration({
			deletable: false,
			editable: true,
			editWidget: new networkMap.Graph.Module.Settings(this.defaults.node, this.defaults.link, this.properties).toElement(),
			target: this,
			type: 'graph',
			targetName: 'graph'
		}));
		
		this.settings.addEvent('active', this.enableEditor.bind(this));
		this.settings.addEvent('deactive', this.disableEditor.bind(this));
		this.settings.addEvent('save', this.save.bind(this));
	}

	// This is the way to externaly add a link from a GUI		
	this.subscribe('addLink', this.addLinkBySubsriber.bind(this));

	this.addEvent('resize', this.rescale.bind(this));
	
	this.setRefreshInterval(this.properties.get('refreshInterval'));
	
	this.svg.on('click', this._clickHandler.bind(this));

	this.addEvent('load', this.update.bind(this));
	
};

networkMap.extend(networkMap.Graph, networkMap.Observable);
networkMap.extend(networkMap.Graph, networkMap.Mediator);
networkMap.extend(networkMap.Graph, networkMap.Options);

networkMap.extend(networkMap.Graph, {
	
	/**
	 * Set the default options for the graph. The defaults will be 
	 * merged with the current defaults.
	 * 
	 * @param element {string} The element to set default options for.
	 * Can be one of (node|link)
	 * @param defaults {object} An object with key value pairs of options
	 * @return {networkMap.Graph} self
	 */
	setDefaults: function(element, properties){
		if (!this.defaults[element]){
			throw "Illigal element";
		}
		
		// set the properties will merge with configuration from user
		this.defaults[element].set(properties);
		
		// TODO: rework
		this.fireEvent('redraw', [{defaultsUpdated: true}]);
		
		return this;
	},

	/**
	 * Retrive the default configuration for a graph element
	 *
	 * @param element {string} The graph element to return defaults for.
	 * @return {object} the default configuration 
	 */
	getDefaults: function(element){
		if (!this.defaults[element]){
			throw "Illigal element";
		}
		
		return this.defaults[element];
	},

	/** 
	 * Set the intervall which the graph should refresh
	 *
	 * @param interval {int} interval in seconds. If null it 
	 * will disable the updates.  
	 * @return {networkMap.Graph} self
	 */
	setRefreshInterval: function(interval){
		this.properties.set('refreshInterval', interval);
		
		if (interval){
			this.intervalId = setInterval(function(){
				this.update();
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
		var docSize = {
			x: this.element.offsetWidth,
			y: this.element.offsetHeight
		};	
		
		this.svg.size(
			docSize.x, 
			docSize.y
		);
					
		var bbox = this.graph.bbox();	
		
		if (docSize.x > (Math.abs(bbox.x) + bbox.width) && docSize.y > (Math.abs(bbox.y) + bbox.height)){
			// the svg is within the docSize (with the exception if we have negative bbox.x and bbox.y
			this.svg.viewbox(
				(bbox.x < 0) ? bbox.x : 0,
				(bbox.y < 0) ? bbox.y : 0,
				docSize.x,
				docSize.y		
			);
		}
		else if (docSize.x > bbox.width && docSize.y > bbox.height){
			// the svg fits without scaling
			this.svg.viewbox(
				bbox.x - (docSize.x - bbox.width) / 2, 
				bbox.y - (docSize.y - bbox.height) / 2, 
				docSize.x, 
				docSize.y);
		}	
		else {
			// scale the svg to fit
			var scaleFactor = ((bbox.width - docSize.x) > (bbox.height - docSize.y)) ? bbox.width / docSize.x : bbox.height / docSize.y;
			this.svg.viewbox(
				bbox.x - 5, 
				bbox.y - 5, 
				docSize.x * scaleFactor + 10, 
				docSize.y * scaleFactor + 10
			);
			//this.svg.viewbox(bbox.x, bbox.y, bbox.width + Math.abs(bbox.x), bbox.height + Math.abs(bbox.y));
		}
		
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
	 * Generates HTML that is used for configuration
	 *
	 * @this {networkMap.Graph}
	 * @return {Element} A HTML Element that contains the UI
	 */
	getSettingsWidget: function(){
		var container = new networkMap.widget.Accordion();
		var accordionGroup;

		var changeHandler = function(defaults, key){
			return function(e, widget){
				defaults.set(key, widget.value());
			}.bind(this);
		}.bind(this);
	
		accordionGroup = container.add('Globals');
		accordionGroup.appendChild(new networkMap.widget.GridInput('Grid', {
			enabled: this.options.gridEnabled,
			grid: this.options.grid
		}).addEvent('change', function(e){
			if (e.value.enabled)
				this.grid(e.value.grid);
			else
				this.grid(false);
		}.bind(this)));
				
	
		accordionGroup = container.add('Node Defaults');		
		networkMap.each(networkMap.Node.defaultTemplate, function(option, key){
			if (option.type === 'number'){
				accordionGroup.appendChild(
					new networkMap.widget.IntegerInput(option.label, this.defaults.node.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.node, key)
					)
				);
			}
			else if(option.type === 'text'){
				accordionGroup.appendChild(
					new networkMap.widget.TextInput(option.label, this.defaults.node.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.node, key)
					)
				);
			}
			else if (option.type === 'color'){
				accordionGroup.appendChild(
					new networkMap.widget.ColorInput(option.label, this.defaults.node.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.node, key)
					)
				);
			}
		}.bind(this));
		
		accordionGroup = container.add('Link Defaults');		
		networkMap.each(networkMap.Link.defaultTemplate, function(option, key){
			if (option.type === 'number'){
				accordionGroup.appendChild(
					new networkMap.widget.IntegerInput(option.label, this.defaults.link.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.link, key)
					)
				);
			}
			else if(option.type === 'text'){
				accordionGroup.appendChild(
					new networkMap.widget.TextInput(option.label, this.defaults.link.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.link, key)
					)
				);
			}
			else if (option.type === 'color'){
				accordionGroup.appendChild(
					new networkMap.widget.ColorInput(option.label, this.defaults.link.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.link, key)
					)
				);
			}
		}.bind(this));
				
		
		return container;
	},

	grid: function(grid){
		if (grid === true){
			this.properties.set('gridEnabled', true);
			
			return this;
		}
		
		if (grid === false){
			this.properties.set('gridEnabled', false);	
		}		
		
		if (grid === undefined){
			if (!this.properties.get('gridEnabled'))
				return false;
				
			return this.properties.get('grid');
		}
		
		if (typeof grid === 'object'){
			this.properties.set('gridEnabled', true);			
			this.properties.set('grid', grid);
		}

		
		return this.onGridChange();
	},
	
	onGridChange: function(){
		this.disableDraggableNodes();
		this.enableDraggableNodes();
		
		return this;
	},
	
	onUtilizationLabelsChange: function(){
		var options = this.properties.get('utilizationLabels');
		this.links.forEach(function(link){
			link.setUtilizationLabelOptions(options);
		});
		options = null;
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
		if (typeof obj == 'string' || obj instanceof String){
			return this.loadUrl(obj);
		}
		else if (obj !== null && typeof obj === 'object'){
			return this.loadObject(obj);
		}
		else{
			throw new TypeError('Unknown type ' + Object.prototype.toString.call(obj));
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
		var request = new XMLHttpRequest();
		request.open('GET', url, true);

		request.onload = function() {
			if (request.status >= 200 && request.status < 400){
				// Success!
				this.loadObject(JSON.parse(request.responseText));
			} else {
				new networkMap.widget.Modal().alert('There was an error when loading the weathermap (' + request.status + ')', {title: 'Error'});
			}
		}.bind(this);

		request.onerror = function() {
			new networkMap.widget.Modal().alert('An error occurred when trying to load the resource', {title: 'Error'});
		};

		request.send();

		return this;
	},

	/**
	 * Load an object representation of a network map.
	 *
	 * @param {Object} The Object representation of the mao
	 * @ retrun {networkMap.Graph} self
	 */
	loadObject: function(mapStruct){
		this.setOnSave(mapStruct.onSave);
		mapStruct.nodes = mapStruct.nodes || [];
		mapStruct.links = mapStruct.links || [];
		
		if (mapStruct.defaults){
			// TODO: Refactor (this should not be saved as string in the JSON on the server)		
			if (mapStruct.defaults.graph && mapStruct.defaults.graph.utilizationLabels && mapStruct.defaults.graph.utilizationLabels.enabled === 'false')
				mapStruct.defaults.graph.utilizationLabels.enabled = false;
			if (mapStruct.defaults.graph && mapStruct.defaults.graph.utilizationLabels && mapStruct.defaults.graph.utilizationLabels.enabled === 'true')
				mapStruct.defaults.graph.utilizationLabels.enabled = true;
				
			this.properties.set(mapStruct.defaults.graph || {});
			this.onUtilizationLabelsChange();
		
			this.setDefaults('node', mapStruct.defaults.node || {});
			this.setDefaults('link', mapStruct.defaults.link || {});
		}
		
		mapStruct.nodes.forEach(function(node){
			node.graph = this;
			node.draggable = this.properties.get('allowDraggableNodes');
			
			this.addNode(new networkMap.Node(node), false);
		}.bind(this));

		mapStruct.links.forEach(function(link){
			link.graph = this;
			this.addLink(new networkMap.Link(link), false);
		}.bind(this));

		// TODO: Clean up!!!		
		this.settings.setConfigWidget(new networkMap.Graph.Module.Settings(this.defaults.node, this.defaults.link, this.properties).toElement());
		
		this.fireEvent('load', [this]);
		this.triggerEvent('resize', this);

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

		var html = this.settings.btnSave.innerHTML;
		this.settings.btnSave.textContent = '.....';

		//var params = networkMap.toQueryString(data);
		var request = new XMLHttpRequest();

		request.open(this.saveData.method, this.saveData.url, true);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		
		//request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		request.onload = function() {
			this.settings.btnSave.innerHTML = html;
			if (request.status >= 200 && request.status < 400){
				data = JSON.parse(request.responseText);
				if (data.status === 'ok'){
					new networkMap.widget.Modal().alert('Weathermap saved');
				}
				if (data.status === 'nok'){
					new networkMap.widget.Modal().alert(data.error, {title: 'Error'});
				}
				if (data.status == 'deleted'){
					new networkMap.widget.Modal().alert('The networkmap is deleted', {title: 'Error'});
				}
			} else {
				new networkMap.widget.Modal()
					.alert('There was an error while saving the weathermap (' + request.status + ')', {title: 'Error'});
			}
		}.bind(this);

		request.onerror = function() {
			this.settings.btnSave.innerHTML = html;
			new networkMap.widget.Modal()
				.alert('There was an error while saving the weathermap', {title: 'Error'});
		};

		request.send(JSON.stringify(data));
	
		return true;
	},

	mode: function(){
		return this._mode;
	},

	/**
	 * Set nodes and links in edit mode
	 *
	 * @ retrun {networkManager.Graph} self
	 */
	enableEditor: function(){
		this.enableDraggableNodes();
		this.nodes.forEach(function(node){
			node.mode('edit');
		});

		this.links.forEach(function(link){
			link.mode('edit');
		});
		
		this._mode = 'edit';

		return this;
	},

	/**
	 * Disable edit mode on nodes and links.
	 *
	 */
	disableEditor: function(){
		this.disableDraggableNodes();
		
		this.nodes.forEach(function(node){
			node.mode('normal');
		});
		this.links.forEach(function(link){
			link.mode('normal');
		});

		this._mode = 'normal';

		return this;
	},
	
	_clickHandler: function(e){
		if (this._mode !== 'edit'){
			return;
		}
		
		if (e.target.instance === this.svg || e.target.instance === this.graph){
			this.settings.displayDefaultView();
		}
		//TODO: REMOVE
		/* 
		if (e.target.instance === this.svg || e.target.instance === this.graph){
			this.publish('edit', new networkMap.event.Configuration({
				deletable: false,
				editable: true,
				editWidget: new networkMap.Graph.Module.Settings(this.defaults.node, this.defaults.link, this.properties).toElement(),
				target: this,
				type: 'graph',
				targetName: 'graph'
			}));
		}
		*/
	},

	/**
	 * Enable draggable nodes
	 *
	 * @ retrun {networkMap.Graph} self
	 */
	enableDraggableNodes: function(){
		this.nodes.forEach(function(node){
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
		this.nodes.forEach(function(node){
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
			defaults: {
				graph: this.properties.extract(),
				node: this.defaults.node.extract(),
				link: this.defaults.link.extract()
			},
			nodes: [],
			links: [],
			onSave: this.saveData
		};

		// self
		this.exportedOptions.forEach(function(option){
			configuration[option] = this.options[option];
		}.bind(this));
		configuration.onSave = this.saveData;

		// nodes
		this.nodes.forEach(function(node){
			configuration.nodes.push(node.getConfiguration());
		});

		// links
		this.links.forEach(function(link){
			configuration.links.push(link.getConfiguration());
		});

		return configuration;
	},

	registerLinkGenerator: function(component, f){
		this._linkGenerator[component] = f;
	},

	/**
	 * Add a node to the graph
	 *
	 * @param {networkMap.Node} The node to add
	 * @param {Boolean ? true } If set to false the resize event will not be triggered
	 * @ retrun {networkMap.Graph} self
	 * @todo refactor to a factory method
	 */
	addNode: function(node, refresh){
		this.nodes.push(node);

		// listen to the requestHref to provide node href
		node.addEvent('requestHref', this.node.linkGenerator);
		
		// as the node is already created we need to trigger an update of the link
		node.updateLink();

		if (refresh !== false){
			this.triggerEvent('resize', this);	
		}

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
		return networkMap.find(this.nodes, function(node){	
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

		this.getLinks(node).forEach(function(link){
			this.removeLink(link);
		}.bind(this));		
		
		return this;
	},

	/**
	 * Add a link to the graph
	 *
	 * @param {networkMap.Link} The link to add
	 * @param {Boolean ? true} If set to false the resize event will not be triggered
	 * @ retrun {networkMap.Graph} self
	 * @todo this should happen when the setting 
	 *	the graph in the link.
	 */
	addLink: function(link, refresh){
		this.links.push(link);

		// listen to the requestHref to provide link href
		link.addEvent('requestHref', this.link.linkGenerator);
		
		// as the link is already created we need to trigger an update of the link
		link.updateLink();


		if (refresh !== false){
			this.triggerEvent('resize', this);	
		}


		return this;
	},	
	
	addLinkBySubsriber: function(e){
		var self = this;
		if (e.nodes){
			e.nodes.each(function(options){
				if (self.getNode(options.id))
					return;
				
				options.graph = options.graph || self;
				var node = new networkMap.Node(options);
				self.addNode(node);
				
				// TODO: The node should now this
				if (self.mode() === 'edit'){
					node.draggable().mode('edit');	
				}
			});	
		}
		
		
		if (!this.getLink(e.link.nodeA.id, e.link.nodeB.id)){
			e.link.graph = e.link.graph || this;
			var link = new networkMap.Link(e.link);
			this.addLink(link);
			link.update(true);
			
			if (this.mode() === 'edit'){
				link.mode('edit')	;
			}
		}
		return this;
	},

	getLink: function(nodeIdA, nodeIdB){
		return networkMap.find(this.links, function(link){
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
		
		this.links.forEach(function(link){
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
		console.log("refresh is depricated, use update instead");

		return this.update();
	},

	registerUpdateEvent: function(datasource, url, link, callback){
		this.$updateQ = this.$updateQ || {}; 
		this.$updateQ[datasource] = this.$updateQ[datasource] || {};
		this.$updateQ[datasource][url] = this.$updateQ[datasource][url] || [];

		// register datasources for internal use in the link
		this.$updateQ[datasource][url].push({
			link: link,
			callback: callback
		});
	},

	/**
	 * Refresh links in batch mode. This method does not work
	 * at the moment.
	 */
	update: function(){
		if (this.properties.get('batchUpdate'))
			return this.batchUpdate();		
		
		this.links.forEach(function(link){
			link.localUpdate();
		});

		return this;
	},
	
	batchUpdate: function(){
		this.$updateQ = this.$updateQ || {};
		networkMap.each(this.$updateQ, function(urls, datasource){
			if (!networkMap.datasource[datasource]){
				throw 'Unknown datasource (' + datasource + ')';
			}
			
			networkMap.each(urls, function(requests, url){
				networkMap.datasource[datasource](url, requests);
			}.bind(this));
		}.bind(this));
		
		return this;
	},
	
	


});