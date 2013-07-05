var networkMap = networkMap || {};

networkMap.path = function(svg){
	return svg.path().attr({ 
		fill: 'none',
		stroke: '#000'
	});
};

Array.implement('find', function(fn){
	for (var i = 0; i < this.length; i++){
		if (fn.call(this, this[i], i, this)) 
			return this[i];
	}
});







/*
networkMap.Point = new Class({
	initialize: function(x, y){
		this.x = x;
		this.y = y;
	},

	round: function(precision){
		this.x = this.x.round(precision);
		this.y = this.y.round(precision);
		return this;
	}


});

networkMap.path = function(svg){
	return svg.path().attr({ 
		fill: 'none',
		stroke: '#000'
	});
};

networkMap.math = {
	angle: function(p1, p2){
		return Math.atan2(p2.x - p1.x, p2.y - p1.y);
	},


	angleRound: function(angle, directions){
		var scope = 2 * Math.PI / directions,
			i = 0;

		angle = angle;

		for (i = -directions; i <= directions; i++){
			if (i * scope - scope / 2 <= angle && angle < (i+1) * scope - scope / 2){
				if (i * scope + Math.PI > 5)
					return 0;
				return i * scope + Math.PI;
			}
		}
	},

	Line: new Class({
		initialize: function(p1, p2){
			this.p1 = p1;
			this.p2 = p2;
			this.update(p1, p2);
		},

		draw: function(svg){
			return networkMap.path(svg).M(this.p1).L(this.p2);
		},
		update: function(p1, p2){               
				this.a = this.p2.y - this.p1.y;
				this.b = this.p1.x - this.p2.x;

				this.c = p1.x * p2.y - p2.x * p1.y; 

				return this;
		},

		round: function(precision){
			this.p1.x = this.p1.x.round(precision);
			this.p1.y = this.p1.y.round(precision);

			this.p2.x = this.p2.x.round(precision);
			this.p2.y = this.p2.y.round(precision);

			return this;
		},

		parallel: function(line){
			return (this.a * line.b - line.a * this.b) === 0;			
		},

		move: function(from, towards, distance){
			var sign;
			if (Math.abs(from.x - towards.x) > 0.00001){
				sign = (from.x > towards.x) ? -1 : 1;
			}
			else{
				sign = (from.y > towards.y) ? -1 : 1;
				return new networkMap.Point(
					from.x + 0, 
					from.y + sign * distance
				);
			}

			var theta = Math.atan((this.p1.y - this.p2.y) / (this.p1.x - this.p2.x));
			var dy = distance * Math.sin(theta);
			var dx = distance * Math.cos(theta);
			return new networkMap.Point(from.x + sign * dx, from.y + sign * dy);
		},

		intersection: function(line){
			var det = this.a * line.b - line.a * this.b;

			var point = new networkMap.Point(
				(line.b * this.c - this.b * line.c) / det,
				(this.a * line.c - line.a * this.c) / det
			);
			point.parallel = (det === 0);

			return point;

		},
		segmentLengthSquared: function() {
			var xdist = this.p2.x - this.p1.x;
			var ydist = this.p2.y - this.p1.y;
			return xdist * xdist + ydist * ydist;
		},

		midPoint: function(){

			return new networkMap.Point(
				this.p1.x + (this.p2.x - this.p1.x)/2,
				this.p1.y + (this.p2.y - this.p1.y)/2
			);
		},

		lerp: function(a, b, x) {
			return a + x * (b - a);
		},
		closestLinearInterpolation: function(p) {
			var xChange = this.p2.x - this.p1.x;
			var yChange = this.p2.y - this.p1.y;

			return ((p.x - this.p1.x) * xChange + (p.y - this.p1.y) * yChange) /
				this.segmentLengthSquared();
		},
		interpolatedPoint: function(t) {
			return {
				x: this.lerp(this.p1.x, this.p2.x, t),
				y: this.lerp(this.p1.y, this.p2.y, t)
			};
		},
		getClosestPoint: function(p) {
			return this.interpolatedPoint(
					this.closestLinearInterpolation(p)
				);
		},
		perpendicularPoint: function(p, distance){
			var dx = this.p1.x - this.p2.x;
			var dy = this.p1.y - this.p2.y;

			var dist = Math.sqrt(dx*dx + dy*dy);
			dx = dx / dist;
			dy = dy / dist;
			x1 = p.x + (distance)*dy;
			y1 = p.y - (distance)*dx;
			x2 = p.x - (distance)*dy;
			y2 = p.y + (distance)*dx;

			return new networkMap.math.Line(
				new networkMap.Point(
					p.x + (distance)*dy,
					p.y - (distance)*dx
				),
				new networkMap.Point(
					p.x - (distance)*dy,
					p.y + (distance)*dx
				)
			);
		}

	})


};
*/
;networkMap.datasource = networkMap.datasource || {};

/**
* url: the URL to make the request to
* requests: array of objects containing request information
* {
*    data: {...},
*    callback: function
* }
*/
networkMap.registerDatasource = function(name, f){
	networkMap.datasource[name] = function(url, requests){
		if (typeOf(requests) !== 'array'){
			requests = [requests];
		}
		f(url, requests);
	};
};


networkMap.registerDatasource('simulate', function(url, requests){
	requests.each(function(request){
		var dataPoint = Math.random();

		request.callback({
			url: url,
			request: request.data,
			value: dataPoint,
			realValue: Math.round(dataPoint * 100) + 'Mbps'
		});
	});
});;
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
		menu.grab(new Element('li', {
			html: '<button class="btn btn-primary pull-right">Save</button>',
			'class': 'clearfix', 
			events: {
				click: this.save.bind(this)
			}
		}));

		nav.grab(trigger);
		nav.grab(menu);
		
		return nav;
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
		allowDraggableNodes: false
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

		this.graph = SVG(this.container);
		
		this.legend = new networkMap.ColorLegend(this.options.colormap, {graph: this});

		/*
		var size = this.element.getSize();
		this.size(size.x, size.y);
		*/
		
		this.settings = new networkMap.SettingsManager(this.container);
		this.settings.addEvent('active', this.enableDraggableNodes.bind(this));
		this.settings.addEvent('deactive', this.disableDraggableNodes.bind(this));
		this.settings.addEvent('save', this.save.bind(this));
		this.addEvent('resize', this.rescale.bind(this));
		this.triggerEvent('resize', this);
	},
	triggerEvent: function(event, object){
		object.fireEvent(event, object);
	},
	rescale: function(){
		docSize = this.element.getSize();	
	
		this.graph.size(
			docSize.x, 
			docSize.y
		);
	
		return this;		
	},
	getSVG: function(){
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
			networkMap.datasource[this.options.datasource](
				requestUrl, 
				requestData, 
				function(result){console.log(result);}
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
		draggable: false
		//onMove
	},
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
		'style'
	],
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
	getConfiguration: function(){
		var configuration = {};

		this.exportedOptions.each(function(option){
			configuration[option] = this.options[option];
		}.bind(this));
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
	
	x: function(){
		return this.svg.bbox().x;
	},
	
	y: function(){
		return this.svg.bbox().y;
	},
	draggable: function(){
		this.svg.draggable();
		this.svg.style('cursor', 'move');

	},	
	fixed: function(){
		this.svg.fixed();
		this.svg.style('cursor', 'default');
	},
	bbox: function(){
		return this.svg.bbox();
	},
	draw: function(){
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
			this.debug = this.graph.getSVG().group();
		}

		// create a group object 
		var svg = this.svg = this.graph.getSVG().group();

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
networkMap.Node.label.rederer.normal = function(){};;networkMap.Link = new Class({
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
		'background',
		'nodeA',
		'nodeB'
	],
	pathPoints: [],
	svgEl: {},
	updateQ: {},

	initialize: function(options){
		this.graph = options.graph;
		options.graph = null;

		this.setOptions(options);

		// setup datasource
		this.options.datasource = this.options.datasource || this.graph.options.datasource;
		this.datasource = networkMap.datasource[this.options.datasource];

		if (!this.options.nodeA || !this.options.nodeB){
			throw "Link(create, missing node in link definition)";
		}

		this.nodeA = this.graph.getNode(this.options.nodeA.id);
		if (!this.nodeA){
			throw "Link(create, nodeA does not exist (" + this.options.nodeA.id + ")";
		}

		// add a holder for SVG objects
		if (this.options.nodeA.requestData || this.options.nodeA.sublinks){
			this.svgEl.nodeA = {};

			if (this.options.nodeA.sublinks){
				this.svgEl.nodeA.sublinks = [];
			}
		}

		this.nodeB = this.graph.getNode(this.options.nodeB.id);
		if (!this.nodeA){
			throw "Link(create, nodeB does not exist (" + this.options.nodeB.id + ")";
		}

		// Add a holder for SVG objects
		if (this.options.nodeB.requestData || this.options.nodeB.sublinks){
			this.svgEl.nodeB = {};

			if (this.options.nodeB.sublinks){
				this.svgEl.nodeB.sublinks = [];
			}

		}

		if (this.graph){
			this.draw();
		}
	},
	getConfiguration: function(){
		var configuration = {};

		this.exportedOptions.each(function(option){
			configuration[option] = this.options[option];
		}.bind(this));
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
			this.debug = this.graph.getSVG().group();
		}
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
		var svg = this.svg = this.graph.getSVG().group();
		svg.back();
		
		var bboxA = this.nodeA.bbox();
		var bboxB = this.nodeB.bbox();
		this.shadowPath = svg.path().attr({ 
			fill: 'none',
			stroke: '#000', 
			'stroke-dasharray': '3,5',
			'stroke-width': 2 
		});

		this.redrawShadowPath();
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
			this.hidePaths();
		}.bind(this));
		this.nodeB.addEvent('dragstart', function(event){
			this.hidePaths();
		}.bind(this));

		this.nodeA.addEvent('dragend', function(event){
			this.drawMainPath();
			this.drawSublinks();
			this.showPaths();
			
		}.bind(this));
		this.nodeB.addEvent('dragend', function(event){
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
		function hide(node){
			if (node.mainPath){
				node.mainPath.hide();
			}
			if (node.sublinks){
				node.sublinks.each(function(sublink){
					sublink.hide();
				});
			}
		}

		if (this.svgEl.nodeA){
			hide(this.svgEl.nodeA);
		}
		if (this.svgEl.nodeB){
			hide(this.svgEl.nodeB);
		}

		return this;
	},
	showPaths: function(){
		function show(node){
			if (node.mainPath){
				node.mainPath.show();
			}
			if (node.sublinks){
				node.sublinks.each(function(sublink){
					sublink.show();
				});
			}
		}
		
		if (this.svgEl.nodeA){
			show(this.svgEl.nodeA);
		}
		if (this.svgEl.nodeB){
			show(this.svgEl.nodeB);
		}

		return this;
	},
	drawMainPath: function(){
		var maxLinkCount = 1;
		if (this.options.sublinks){
			maxLinkCount = this.options.sublinks.length;
		}

		var firstSegment = new SVG.math.Line(this.pathPoints[0], this.pathPoints[2]);
		var midSegment = new SVG.math.Line(this.pathPoints[2], this.pathPoints[3]);
		var lastSegment = new SVG.math.Line(this.pathPoints[3], this.pathPoints[5]);

		// perpendicular line with last point in firstList
		var helpLine1 = firstSegment.perpendicularLine(this.pathPoints[1], maxLinkCount * this.options.width);
		var helpLine2 = firstSegment.perpendicularLine(this.pathPoints[2], maxLinkCount * this.options.width);
		var helpLine3 = midSegment.perpendicularLine(this.pathPoints[2], maxLinkCount * this.options.width);
		
		var midPoint = midSegment.midPoint();
		var helpPoint1 = midSegment.move(midPoint, midSegment.p1, this.options.arrowHeadLength);
		var helpPoint2 = midSegment.move(midPoint, midSegment.p2, this.options.arrowHeadLength);
		
		var helpLine4 = midSegment.perpendicularLine(helpPoint1, maxLinkCount * this.options.width);

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

		if (!this.svgEl.nodeA.mainPath){
			var pathA = this.svgEl.nodeA.mainPath = networkMap.path(this.svg);

			this.registerUpdateEvent(
				this.options.datasource, 
				this.options.nodeA.requestUrl, 
				this.options.nodeA.requestData,
				function(response){
					this.updateBgColor(pathA, this.options.colormap.translate(response.value));
				}.bind(this)
			);
		}
		
		this.svgEl.nodeA.mainPath.clear();
		
		this.svgEl.nodeA.mainPath
			.M(this.pathPoints[0])
			.L(helpLine1.p1).L(intersectPoint1).L(helpLine4.p1)
			.L(midPoint)
			.L(helpLine4.p2).L(intersectPoint2).L(helpLine1.p2)
			.Z();

		
		
		helpLine1 = firstSegment.perpendicularLine(this.pathPoints[4], maxLinkCount * this.options.width);
		helpLine2 = firstSegment.perpendicularLine(this.pathPoints[3], maxLinkCount * this.options.width);
		helpLine3 = midSegment.perpendicularLine(this.pathPoints[3], maxLinkCount * this.options.width);		

		helpLine4 = midSegment.perpendicularLine(helpPoint2, maxLinkCount * this.options.width);

		// find intersection point 1
		helpLine5 = new SVG.math.Line(helpLine1.p1, helpLine2.p1);
		helpLine6 = new SVG.math.Line(helpLine3.p1, helpLine4.p1);
		intersectPoint1 = helpLine6.intersection(helpLine5);

		if (intersectPoint1.parallel === true){
			intersectPoint1 = helpLine3.p1;
		}


		// find intersection point 2
		helpLine5 = new SVG.math.Line(helpLine1.p2, helpLine2.p2);
		helpLine6 = new SVG.math.Line(helpLine3.p2, helpLine4.p2);
		intersectPoint2 = helpLine6.intersection(helpLine5);

		if (intersectPoint2.parallel === true){
			intersectPoint2 = helpLine2.p2;
		}

		if (!this.svgEl.nodeB.mainPath){
			var pathB = this.svgEl.nodeB.mainPath = networkMap.path(this.svg);

			this.registerUpdateEvent(
				this.options.datasource, 
				this.options.nodeB.requestUrl, 
				this.options.nodeB.requestData,
				function(response){
					this.updateBgColor(pathB, this.options.colormap.translate(response.value));
				}.bind(this)
			);
		}
		this.svgEl.nodeB.mainPath.clear();
		
		this.svgEl.nodeB.mainPath
			.M(this.pathPoints[5])
			.L(helpLine1.p1).L(intersectPoint1).L(helpLine4.p1)
			.L(midPoint)
			.L(helpLine4.p2).L(intersectPoint2).L(helpLine1.p2)
			.Z();
		
		

		return this;
	},
	drawSublinks: function(){
		var maxLinkCount, lastSegment, offset, path, width;
		
		var draw = function(node, startPoint, path){
			var sublink = 0;

			var updateColor = function(self, path){
				return function(response){
					this.updateBgColor(path, this.options.colormap.translate(response.value));
				}.bind(self);
			};
			
			while (offset >= -maxLinkCount / 2){
				var options = {
					width: width
				};
				

				var currentSegment = this.calculateSublinkPath(path, offset, options);

				if (lastSegment){
					if (!node.sublinks[sublink]){
						node.sublinks[sublink] = networkMap.path(this.svg);

						var callback = 

						this.registerUpdateEvent(
							this.options.datasource, 
							this.options.nodeB.requestUrl, 
							this.options.nodeB.requestData,
							updateColor(this, node.sublinks[sublink])
							/* testing an alternative way
							(function(path){
								return function(response){
									this.updateBgColor(path, this.options.colormap.translate(response.value));
								}.bind(this);
							}.bind(this))(node.sublinks[sublink])
							*/
						);
					}
					node.sublinks[sublink].clear();

					// Special case when we are ploting a odd number
					// of sublinks. We must add the middlepoint manually
					if (offset === -0.5){
						node.sublinks[sublink]
							.M(startPoint)
							.L(lastSegment[0]).L(lastSegment[1]).L(lastSegment[2])
							.L(path[path.length - 1])
							.L(currentSegment[2]).L(currentSegment[1]).L(currentSegment[0])
							.Z().front();
					}
					else{
						node.sublinks[sublink]
							.M(startPoint)
							.L(lastSegment[0]).L(lastSegment[1]).L(lastSegment[2])
							.L(currentSegment[2]).L(currentSegment[1]).L(currentSegment[0])
							.Z().front();
					}

					sublink += 1;
				}
				lastSegment = currentSegment;
				offset -= 1;
			}
		}.bind(this);

		if (this.options.nodeA.sublinks){
			maxLinkCount = this.options.nodeA.sublinks.length;
			lastSegment = null;
			offset = maxLinkCount / 2;
			path = [
				this.pathPoints[0],
				this.pathPoints[1],
				this.pathPoints[2],
				new SVG.math.Line(this.pathPoints[2], this.pathPoints[3]).midPoint()
			];
			width = this.options.nodeA.width || this.options.width;
			draw(this.svgEl.nodeA, this.pathPoints[0], path);
		}
		if (this.options.nodeB.sublinks){
			maxLinkCount = this.options.nodeB.sublinks.length;
			lastSegment = null;
			offset = maxLinkCount / 2;
			path = [
				this.pathPoints[5],
				this.pathPoints[4],
				this.pathPoints[3],
				new SVG.math.Line(this.pathPoints[3], this.pathPoints[2]).midPoint()
			];
			width = this.options.nodeB.width || this.options.width;
			draw(this.svgEl.nodeB, this.pathPoints[5], path);
		}

		return this;
	},
	calculateSublinkPath: function(path, offset, options){
		var localWidth = options.width || this.options.width;
		var width = localWidth * offset;
		var arrowHeadLength = Math.abs(this.options.arrowHeadLength * offset * (localWidth/this.options.width));

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

	registerUpdateEvent: function(datasource, url, data, callback){
		if (!this.updateQ[datasource]){
			this.updateQ[datasource] = {};
		}

		if (!this.updateQ[datasource][url]){
			this.updateQ[datasource][url] = [];
		}

		this.updateQ[datasource][url].push({
			data: data,
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
			path.fill(this.options.background);
		}
		else{
			path.fill(color);
		}
	}


});
