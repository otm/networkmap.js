
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

	/** The default configuration */
	defaults: {
		node: {
			padding: 10,
			fontSize: 16,
			bgColor: '#dddddd',
			strokeColor: '#000000',
			strokeWidth: 2
		},
		link: {
			width: 10,
			inset: 10,
			connectionDistance: 10,
			staticConnectionDistance: 30,
			arrowHeadLength: 10
		}
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

	/** An internal reference to check keep track of the mode */
	_mode: 'normal',

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
		
		this.legend = new networkMap.ColorLegend(this.options.colormap, {graph: this, target: this.container});

		if (this.options.enableEditor){
			this.settings = new networkMap.SettingsManager(this.container);
			this.settings.addEvent('active', this.enableEditor.bind(this));
			this.settings.addEvent('deactive', this.disableEditor.bind(this));
			this.settings.addEvent('save', this.save.bind(this));
		}
			
		this.addEvent('resize', this.rescale.bind(this));
		
		this.setRefreshInterval(this.options.refreshInterval);
		
		this.svg.on('click', this._clickHandler.bind(this));		
	},
	
	/**
	 * Set the default options for the graph. The defaults will be 
	 * merged with the current defaults.
	 * 
	 * @param element {string} The element to set default options for.
	 * Can be one of (node|link)
	 * @param defaults {object} An object with key value pairs of options
	 * @return {networkMap.Graph} self
	 */
	setDefaults: function(element, defaults){
		if (!this.defaults[element]){
			throw "Illigal element";
		}
		
		Object.merge(this.defaults[element], defaults);
		
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
		
		this.svg.size(
			docSize.x, 
			docSize.y
		);
					
		var bbox = this.graph.bbox();	
			
		// scale the svg if the docsize is to small
		if (docSize.x < (bbox.width + bbox.x) || docSize.y < (bbox.height + bbox.y)){
			this.svg.viewbox(bbox.x, bbox.y, bbox.width + bbox.x, bbox.height + bbox.y);
		}
		else{
			this.svg.viewbox(0, 0, docSize.x, docSize.y);
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
			return function(e){
				defaults[key] = e.target.value;
				this.fireEvent('redraw', [{defaultsUpdated: true}]);
			}.bind(this);
		}.bind(this);
			
	
		accordionGroup = container.add('Node Defaults');		
		Object.each(networkMap.Node.defaultTemplate, function(option, key){
			if (option.type === 'number'){
				accordionGroup.grab(new networkMap.widget.IntegerInput(option.label, this.defaults.node[key], option).addEvent('change', changeHandler(this.defaults.node, key)));
			}
			else if(option.type === 'text'){
				accordionGroup.grab(new networkMap.widget.TextInput(option.label, this.defaults.node[key], option).addEvent('change', changeHandler(this.defaults.node, key)));
			}
			else if (option.type === 'color'){
				accordionGroup.grab(new networkMap.widget.ColorInput(option.label, this.defaults.node[key], option).addEvent('change', changeHandler(this.defaults.node, key)));
			}
		}.bind(this));
		
		accordionGroup = container.add('Link Defaults');		
		Object.each(networkMap.Link.defaultTemplate, function(option, key){
			if (option.type === 'number'){
				accordionGroup.grab(new networkMap.widget.IntegerInput(option.label, this.defaults.link[key], option).addEvent('change', changeHandler(this.defaults.link, key)));
			}
			else if(option.type === 'text'){
				accordionGroup.grab(new networkMap.widget.TextInput(option.label, this.defaults.link[key], option).addEvent('change', changeHandler(this.defaults.link, key)));
			}
			else if (option.type === 'color'){
				accordionGroup.grab(new networkMap.widget.ColorInput(option.label, this.defaults.link[key], option).addEvent('change', changeHandler(this.defaults.link, key)));
			}
		}.bind(this));
				
		
		return container;
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
		this.setOnSave(mapStruct.onSave);
		
		if (mapStruct.defaults){
			this.setDefaults('node', mapStruct.defaults.node || this.defaults.node);
			this.setDefaults('link', mapStruct.defaults.link || this.defaults.link);
		}
		
		mapStruct.nodes.each(function(node){
			node.graph = this;
			node.draggable = this.options.allowDraggableNodes;
			this.addNode(new networkMap.Node(node), false);
		}.bind(this));

		mapStruct.links.each(function(link){
			link.graph = this;
			this.addLink(new networkMap.Link(link), false);
		}.bind(this));
		
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

		var html = this.settings.btnSave.get('html');
		this.settings.btnSave.set('text', '.....');
		 
		new Request.JSON({
			url: this.saveData.url,
			method: this.saveData.method,
			'data': data,
			onSuccess: function(response){
				this.settings.btnSave.set('html', html);
				if (response.status === 'ok'){
					new networkMap.widget.Modal().alert('Weathermap saved');
				}
				if (response.status === 'nok'){
					new networkMap.widget.Modal().alert(response.error, {title: 'Error'});
				}
				if (response.status == 'deleted'){
					new networkMap.widget.Modal().alert('The networkmap is deleted', {title: 'Error'});
				}
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
		
		this._mode = 'edit';

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

		this._mode = 'normal';

		return this;
	},
	
	_clickHandler: function(e){
		if (this._mode !== 'edit'){
			return;
		}
		
		if (e.target.instance === this.svg || e.target.instance === this.graph){
			this.settings.edit(this);
		}
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
			defaults: this.defaults,
			nodes: [],
			links: [],
			onSave: this.saveData
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
	 * @param {Boolean ? true } If set to false the resize event will not be triggered
	 * @ retrun {networkMap.Graph} self
	 * @todo refactor to a factory method
	 */
	addNode: function(node, refresh){
		this.nodes.push(node);

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
	 * @param {Boolean ? true} If set to false the resize event will not be triggered
	 * @ retrun {networkMap.Graph} self
	 * @todo this should happen when the setting 
	 *	the graph in the link.
	 */
	addLink: function(link, refresh){
		this.links.push(link);

		if (refresh !== false){
			this.triggerEvent('resize', this);	
		}


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
				
			};
			
			networkMap.datasource[this.options.datasource](
				requestUrl, 
				requestData
			);
		}.bind(this));
	}


});