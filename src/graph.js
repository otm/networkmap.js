
networkMap.Graph = new Class({
	Implements: [Options, Events],
	options:{
		width: 10,
		height: 10,
		datasource: 'simulate',
		colormap: 'flat5',
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
		return this;
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

		this.setOnSave(mapStruct.onSave);
		
		this.fireEvent('load', [this]);

		return this;
	},
	setOnSave: function(saveData){
		if (saveData){
			if (this.validateSave(saveData))
				this.saveData = saveData;
		}
		return this;
	},
	getOnSave: function(){
		return (this.saveData) ? this.saveData : {};
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
	
	removeNode: function(node){
		this.nodes.erase(node);
		node.setGraph(null);

		this.getLinks(node).each(function(link){
			this.removeLink(link);
		}.bind(this));		
		
		return this;
	},

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

	getLinks: function(node){
		var links = [];
		this.links.each(function(link){
			if (link.connectedTo(node)){
				links.push(link);
			}
		});
		
		return links;
	},

	removeLink: function(link){
		this.links.erase(link);
		link.setGraph(null);
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
