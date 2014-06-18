networkMap.Link = function(options){
	
	/** contains referenses to sublinks */
	this.subLinks = {
		nodeA: null,
		nodeB: null	
	};	
	
	// Old structure
	this.pathPoints = [];
	this.updateQ = {};
	this._mode = 'normal';	
	
	/** The current configuration of the utilization label */
	this.utilizationLabelConfiguration = {
		enabled: false,
		fontSize: 8,
		padding: 2
	};
	
	this.graph = options.graph;
	delete options.graph;		

	this.properties = new networkMap.Properties(options, networkMap.Link.defaults);
	this.properties.addEvent('change', function(change){
		this.options = this.properties.configuration();
		this.draw();
	}.bind(this));

	// TODO: Remove this hack
	this.options = this.properties.configuration();

	this.configurationWidget = new networkMap.Link.Module.Settings(this.properties);

	this.colormap = networkMap.colormap[this.properties.get('colormap')];

	// setup datasource
	this.datasource = networkMap.datasource[this.properties.get('datasource')];


	this.setGraph(this.graph);
};

networkMap.extend(networkMap.Link, networkMap.Options);
networkMap.extend(networkMap.Link, networkMap.Observable);

networkMap.extend(networkMap.Link, {

	setProperty: function(key, value){
		if (!this.editTemplate[key]){
			throw 'Unknow id: ' + key;
		}
		
		this.options[key] = value;
		this._localConfig[key] = value;
		
		this.redraw();
	},
	
	getProperty: function(key){
		if (!this.editTemplate[key]){
			throw 'Unknow id: ' + key;
		}
		
		return this.properties.get(key);
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
	
	updateHyperlinks: function(){
		this.subLinks.nodeA.updateHyperlinks();
		this.subLinks.nodeB.updateHyperlinks();
		
		return this;
	},	
	
	connectedTo: function(node, secondaryNode){
		if (secondaryNode){
			return (this.subLinks.nodeA.node == node || this.subLinks.nodeB.node == node) && (this.subLinks.nodeA.node == secondaryNode || this.subLinks.nodeB.node == secondaryNode);
		}
		
		return (this.subLinks.nodeA.node == node || this.subLinks.nodeB.node == node); 
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
		var configuration = this.properties.extract();

		configuration.nodeA = this.subLinks.nodeA.getConfiguration();
		configuration.nodeB = this.subLinks.nodeB.getConfiguration();
		
		return configuration;
	},

	getSibling: function(subLink){
		return (this.subLinks.nodeA === subLink) ? this.subLinks.nodeB : this.subLinks.nodeA;
	},	
	
	setGraph: function(graph){	
		// remove the object from the graph
		if (graph === null){
			this.graph = null;
			this.draw();
		}

		// if a graph is defined draw 
		if (graph){
			this.graph = graph;
			this.properties.setDefaults(this.graph.getDefaults('link'));
			
			// TODO: Setting the colormap and datasource like this is error prone
			this.datasource = this.properties.get('datasource');
			this.colormap = networkMap.colormap[this.properties.get('colormap')];
		
			// TODO: Remove this hack
			this.options = this.properties.configuration();

			// TODO: Legacy code
			this.graph.addEvent('redraw', function(e){
				this.draw();
			}.bind(this));

			this._setupSVG(this.properties.configuration());
			
			this.draw();
		}
	},
	
	_setupSVG: function(options){
		var svg = this.svg = this.graph.getPaintArea().group().back();
		var edge;
		
		this.shadowPath = this.createShadowPath(svg);

		if (!options.nodeA || !options.nodeB){
			throw "Link(create, missing node in link definition)";
		}

		/* NODE A */
		this.nodeA = this.graph.getNode(options.nodeA.id);
		if (!this.nodeA){
			throw "Link(create, nodeA does not exist (" + options.nodeA.id + ")";
		}
		
		edge = new networkMap.Link.Module.Edge(
			this.graph.getPaintArea().group(),
			this.nodeA.bbox(),
			SVG.math.Point.create(0, 0),
			SVG.math.Point.create(0, 0),
			options.nodeA.edge
		)
		.addEvent('updated', this.redrawShadowPath.bind(this))
		.addEvent('dragstart', function(){
			this.hidePaths();
			this.showShadowPath();
		}.bind(this))
		.addEvent('dragend', this.redraw.bind(this));	
	
		
		this.subLinks.nodeA = new networkMap.SubLink(this, this.nodeA, edge, svg)
			.load(options.nodeA)
			.addEvent('redraw', this.redraw.bind(this))
			.addEvent('requestHref', function(sublink){
				this.fireEvent('requestHref', [sublink]);
			}.bind(this));



		/* NODE B */
		this.nodeB = this.graph.getNode(options.nodeB.id);
		if (!this.nodeB){
			throw "Link(create, nodeA does not exist (" + options.nodeB.id + ")";
		}
		
		edge = new networkMap.Link.Module.Edge(
			this.graph.getPaintArea().group(),
			this.nodeB.bbox(),
			SVG.math.Point.create(0, 0),
			SVG.math.Point.create(0, 0),
			options.nodeB.edge
		)
		.addEvent('updated', this.redrawShadowPath.bind(this))
		.addEvent('dragstart', function(){
			this.hidePaths();
			this.showShadowPath();
		}.bind(this))
		.addEvent('dragend', this.redraw.bind(this));	

		this.subLinks.nodeB = new networkMap.SubLink(this, this.nodeB, edge, svg)
			.load(options.nodeB)
			.addEvent('redraw', this.redraw.bind(this))
			.addEvent('requestHref', function(sublink){
				this.fireEvent('requestHref', [sublink]);
			}.bind(this));

		return this;
	},
	
	
	createShadowPath: function(svg){
		return svg.path().attr({ 
			fill: 'none',
			stroke: '#000', 
			'stroke-dasharray': '3,5',
			'stroke-width': 2 
		});
	},
	
	redraw: function(){
		this.redrawShadowPath();
		this.subLinks.nodeA.draw(this.pathPoints, this.properties);
		this.subLinks.nodeB.draw(Array.prototype.slice.call(this.pathPoints).reverse(), this.properties);	
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
		
		this.redrawShadowPath().hideShadowPath();
		this.subLinks.nodeA.draw(this.pathPoints, this.properties);
		this.subLinks.nodeB.draw(Array.prototype.slice.call(this.pathPoints).reverse(), this.properties);	
		
		this.update();

		this.nodeA.addEvent('dragstart', this.onNodeDragStart.bind(this));
		this.nodeB.addEvent('dragstart', this.onNodeDragStart.bind(this));

		this.nodeA.addEvent('drag', this.onNodeDrag.bind(this));
		this.nodeB.addEvent('drag', this.onNodeDrag.bind(this));

		this.nodeA.addEvent('dragend', this.onNodeDragEnd.bind(this));
		this.nodeB.addEvent('dragend', this.onNodeDragEnd.bind(this));

	},

	onNodeDragStart: function(){
		this.shadowPath.show();
		this.hidePaths();
	},	
	
	onNodeDrag: function(){
		this.subLinks.nodeA.edge.setBbox(this.nodeA.bbox());
		this.subLinks.nodeB.edge.setBbox(this.nodeB.bbox());
			
		this.redrawShadowPath();
	},
	
	onNodeDragEnd: function(){
		this.redrawShadowPath().hideShadowPath();
		this.subLinks.nodeA.draw(this.pathPoints, this.properties);
		this.subLinks.nodeB.draw(Array.prototype.slice.call(this.pathPoints).reverse(), this.properties);	
		this.showPaths();
	},

	edgePoints: function(){
		var vec2 = networkMap.vec2;
		
		var bboxA = this.subLinks.nodeA.node.bbox();
		var bboxB = this.subLinks.nodeB.node.bbox();
		
		var confinmentA = vec2.create(bboxA.width/2, bboxA.height/2);
		var confinmentB = vec2.create(bboxB.width/2, bboxB.height/2);

		var path = [];
		
		var inset = parseInt(this.properties.get('inset')) || 1;
		var connectionDistance = parseInt(this.properties.get('connectionDistance')) || 1;
		var staticConnectionDistance = parseInt(this.properties.get('staticConnectionDistance')) || 1;
		
		var a = vec2.create(bboxA.cx, bboxA.cy);
		var b = vec2.create(bboxB.cx, bboxB.cy);
		
		var ab = b.clone().sub(a);
		var dirA = ab.clone().maxDir();	
		var edgePointA = dirA.clone().mul(confinmentA);
		edgePointA.sub(dirA.clone().scale(inset));
		var edgePointerA = edgePointA.clone();
		edgePointA.add(a);
		
		
	
		/* AND NOW FROM THE OTHER SIDE */
		var ba = ab.clone().scale(-1);
		var dirB = ba.clone().maxDir();
		var edgePointB = dirB.clone().mul(confinmentB);
		edgePointB.sub(dirB.clone().scale(inset));
		var edgePointerB = edgePointB.clone();
		edgePointB.add(b);

		this.$edgePoints = this.$edgePoints || {};
		this.$edgePoints = {
			nodeA: {
				point: new SVG.math.Point(edgePointA.x, edgePointA.y),
				pointer: edgePointerA,
				direction: dirA
			},
			nodeB: {
				point: new SVG.math.Point(edgePointB.x, edgePointB.y),
				pointer: edgePointerB,
				direction: dirB
			}
		};
		
		/*
		if (!this.edgeHandle){
			var edgeHandle = this.edgeHandle = new networkMap.Link.Module.Edge(
				this.graph.getPaintArea().group(),
				this.nodeA.bbox(),
				this.$edgePoints.calculated.nodeA.point,
				this.$edgePoints.calculated.nodeA.direction
			);
			
			edgeHandle.addEvent('updated', this.redrawShadowPath.bind(this));
			edgeHandle.addEvent('dragstart', function(){
				this.hidePaths();
				this.showShadowPath();
			}.bind(this));
			edgeHandle.addEvent('dragend', this.redraw.bind(this));
			
			
		} else {
			this.subLinks.nodeB
			this.edgeHandle.setDefaults(edgePointA, dirA);
		}
		
		var edge = this.edgeHandle.getEdge();		
		*/

		

		
		//this.$edgePoints.path = path;
		
		
		
		
		return this.$edgePoints;
	},

	

	redrawShadowPath: function(){
		var edge;
		var path = [];
		var connectionDistance = parseInt(this.properties.get('connectionDistance')) || 1;
		var staticConnectionDistance = parseInt(this.properties.get('staticConnectionDistance')) || 1;

		var edgePoints = this.edgePoints();

		this.pathPoints.length = 0;
		
		this.subLinks.nodeA.edge.setDefaults(edgePoints.nodeA.point, edgePoints.nodeA.direction);		
		this.subLinks.nodeB.edge.setDefaults(edgePoints.nodeB.point, edgePoints.nodeB.direction);		
		
		edge = this.subLinks.nodeA.edge.getEdge();
		path.push(edge.point.clone());
		path.push(edge.point.clone().add(edge.direction.clone().scale(connectionDistance)));
		path.push(edge.point.clone().add(edge.direction.clone().scale(connectionDistance + staticConnectionDistance)));

		edge = this.subLinks.nodeB.edge.getEdge();
		path.push(edge.point.clone().add(edge.direction.clone().scale(connectionDistance + staticConnectionDistance)));
		path.push(edge.point.clone().add(edge.direction.clone().scale(connectionDistance)));
		path.push(edge.point.clone());
		
		
		// TODO: Rewrite, add vec2 functionality to SVG.math.Point
		/*
		edgePoints.path.forEach(function(point){
			this.pathPoints.push(new SVG.math.Point(point.x, point.y));
		}.bind(this));
		*/
		this.pathPoints = path;		
		
		this.shadowPath
			.clear()
			.M(path[0])  //.apply(this.shadowPath, edgePoints.path[0])
			.L(path[2])  //.apply(this.shadowPath, edgePoints.path[2])
			.L(path[3])  //.apply(this.shadowPath, edgePoints.path[3])
			.L(path[5]); //.apply(this.shadowPath, edgePoints.path[5]);

		return this;
	},
	
	removeMainPath: function(){
		if (this.mainPathA)
			this.mainPathA.remove();

		if(this.mainPathB)
			this.mainPathB.remove();
	},
	
	hidePaths: function(){
		this.subLinks.nodeA.hide();
		this.subLinks.nodeB.hide();

		return this;
	},
	showPaths: function(){
		this.subLinks.nodeA.show();
		this.subLinks.nodeB.show();

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


	drawEdgeHandles: function(){
		
		this.subLinks.nodeA.edge.show(this.nodeA.bbox());
		this.subLinks.nodeB.edge.show(this.nodeB.bbox());
		
		return this;
	},
	
	hideEdgeHandles: function(){
		this.subLinks.nodeA.edge.hide();
		this.subLinks.nodeB.edge.hide();
		
		return this;
	},

	setUtilizationLabel: function(){
		this.subLinks.nodeA.setUtilizationLabel();
		this.subLinks.nodeB.setUtilizationLabel();
		
		return this;
	},
	
	setUtilizationLabelOptions: function(options){
		this.subLinks.nodeA.setUtilizationLabelOptions(options);
		this.subLinks.nodeB.setUtilizationLabelOptions(options);
		
		return this;
	},
	
	showUtilizationLabels: function(){
		this.subLinks.nodeA.showUtilizationLabel();
		this.subLinks.nodeB.showUtilizationLabel();
		
		return this;
	},
	
	hideUtilizationLabels: function(){
		this.subLinks.nodeA.hideUtilizationLabel();
		this.subLinks.nodeB.hideUtilizationLabel();
		
		return this;
	},
	
	updateUtilizationLabels: function(){
		this.setUtilizationLabelPositions();
		
		return this;
	},

	setUtilizationLabelPositions: function(){
		this.subLinks.nodeA.setUtilizationLabelPosition();
		this.subLinks.nodeB.setUtilizationLabelPosition();
	
		return this;
	},

	/* TODO: This should not be used, the graph should collect this data */
	registerUpdateEvent: function(datasource, url, link, callback){
		var graph;
		
		this.updateQ[datasource] = this.updateQ[datasource] || {};
		this.updateQ[datasource][url] = this.updateQ[datasource][url] || [];

		// register datasources for internal use in the link
		this.updateQ[datasource][url].push({
			link: link,
			callback: callback
		});
		
		// register the update event in the graf
		this.graph.registerUpdateEvent(datasource, url, link, callback);
	},
	

	update: function(force){
		if (this.properties.get('globalRefresh') && force !== true)
			return this;

		if (!this.graph.properties.get('batchUpdate') || force === true)
		networkMap.each(this.updateQ, function(urls, datasource){
			if (!networkMap.datasource[datasource]){
				throw 'Unknown datasource (' + datasource + ')';
			}
			networkMap.each(urls, function(requests, url){
				if (this.properties.get('batchUpdate')){
					networkMap.datasource[datasource](url, requests);
				}
				else{
					requests.forEach(function(request){
						networkMap.datasource[datasource](url, request);
					});
				}
			}.bind(this));
		}.bind(this));
		
		return this;
	}

});

networkMap.Link.defaultTemplate = {
	width: {
		label: 'Width',
		type: 'number',
		min: 0
	},
	inset: {
		label: 'Inset',
		type: 'number',
		min: 1
	},
	connectionDistance: {
		label: 'Chamfer',
		type: 'number',
		min: 0
	},
	staticConnectionDistance: {
		label: 'Offset',
		type: 'number',
		min: 1
	},
	arrowHeadLength: {
		label: 'Arrow Head',
		type: 'number',
		min: 0
	}
};

/**
 * Register a global handler to provide a href to Links
 * This can be overridden on the networkMap instance or
 * or setting it directly on the link.
 * 
 * The registered function should return a url string 
 * or null if no link should be created.
 *
 * @param {function} A function that returns a URL or null
 */
networkMap.Link.registerLinkGenerator = function(f){
	networkMap.Link._linkGenerator = networkMap.Link.createLinkGenerator(f);
};

networkMap.Link.createLinkGenerator = function(f){
	return function(sublink){
		var href = sublink.properties.get('href');
		if (href){
			if (networkMap.isFunction(href))
				sublink.setLink(href());
			else
				sublink.setLink(href);
			return;
		}
		
		sublink.setLink(f(sublink));
	};
};

/** Register a default link generator which will not create a link */
networkMap.Link.registerLinkGenerator(function(sublink){return null;});

/** Register defaults properties for networkMap.Node */
networkMap.Link.defaults = new networkMap.Properties({
	inset: 10,
	connectionDistance: 10,
	staticConnectionDistance: 30,
	arrowHeadLength: 10,
	width: 10,
	background: '#777',
	globalRefresh: true,
	refreshInterval: 300000,
	datasource: 'simulate',
	batchUpdate: true,
	colormap: 'flat5'
});
