networkMap.Link = function(options){
	

	/** internal debug variable, 0 = off, 1 = normal debug */
	this.$debug = 0;
	this.pathPoints = [];
	this.svgEl = {};
	this.updateQ = {};
	this._mode = 'normal';
	this.path = {};
	this.subpath = {};

	var link, sublink;
	
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
	},
	

	getEditables: function(){
		return this.editTemplate;
	},
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
	updateLink: function(){
		if (this.subpath.nodeA){
			this.subpath.nodeA.forEach(function(sublink){
				sublink.updateLink();
			});
		}

		if (this.subpath.nodeB){
			this.subpath.nodeB.forEach(function(sublink){
				sublink.updateLink();
			});
		}
		if (this.path.nodeA)
			this.path.nodeA.updateLink();
		if (this.path.nodeB)
			this.path.nodeB.updateLink();
		return this;
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
		
		var configuration = this.properties.extract();

		if (this.path.nodeA){
			configuration.nodeA = this.path.nodeA.getConfiguration();			
		}		
		if (this.subpath.nodeA){
			configuration.nodeA = configuration.nodeA || {};
			configuration.nodeA.sublinks = [];
			this.subpath.nodeA.forEach(function(subpath){
				configuration.nodeA.sublinks.push(subpath.getConfiguration());
			});
		}
		
		if (this.path.nodeB){
			configuration.nodeB = this.path.nodeB.getConfiguration();			
		}		
		if (this.subpath.nodeB){
			configuration.nodeB = configuration.nodeB || {};
			configuration.nodeB.sublinks = [];
			this.subpath.nodeB.forEach(function(subpath){
				configuration.nodeB.sublinks.push(subpath.getConfiguration());
			});
		}

		return configuration;
		

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
		this.svg = this.graph.getPaintArea().group();


		if (!options.nodeA || !options.nodeB){
			throw "Link(create, missing node in link definition)";
		}

		this.nodeA = this.graph.getNode(options.nodeA.id);
		if (!this.nodeA){
			throw "Link(create, nodeA does not exist (" + this.options.nodeA.id + ")";
		}

		link = options.nodeA;
		
		if (link.sublinks){
			sublinks = link.sublinks;
			delete link.sublinks;
			this.subpath.nodeA = [];
			sublinks.forEach(function(sublink){
				this.subpath.nodeA.push(
					new networkMap.LinkPath(this, networkMap.path(this.svg), sublink)
					.addEvent('change', this.redraw.bind(this))
					.addEvent('requestHref', function(sublink){this.fireEvent('requestHref', [sublink]);}.bind(this))
				);
			}.bind(this));
		}
		this.path.nodeA = new networkMap.LinkPath(
			this,
			networkMap.path(this.svg), 
			link
		).addEvent('change', this.redraw.bind(this))
		.addEvent('requestHref', function(sublink){this.fireEvent('requestHref', [sublink]);}.bind(this));
		
		
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

		if (link.sublinks){
			sublinks = link.sublinks;
			delete link.sublinks;
			this.subpath.nodeB = [];
			sublinks.forEach(function(sublink){
				this.subpath.nodeB.push(
					new networkMap.LinkPath(this, networkMap.path(this.svg), sublink)
					.addEvent('change', this.redraw.bind(this))
					.addEvent('requestHref', function(sublink){this.fireEvent('requestHref', [sublink]);}.bind(this))
				);
			}.bind(this));
		}
		this.path.nodeB = new networkMap.LinkPath(
			this, 
			networkMap.path(this.svg), 
			link
		).addEvent('change', this.redraw.bind(this))
		.addEvent('requestHref', function(sublink){this.fireEvent('requestHref', [sublink]);}.bind(this));
		
		// Add a holder for SVG objects
		if (this.options.nodeB.requestData || this.options.nodeB.sublinks){
			this.svgEl.nodeB = {};

			if (this.options.nodeB.sublinks){
				this.svgEl.nodeB.sublinks = [];
			}

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
		this.update();

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

	vec2add: function(a, b, out){
		out = out || [0, 0];

		out[0] = a[0] + b[0];
		out[1] = a[1] + b[1];

		return out;
	},

	vec2sub: function(a, b, out){
		out = out || [0, 0];

		out[0] = a[0] - b[0];
		out[1] = a[1] - b[1];

		return out;
	},

	vec2distance: function(a, b){
		var x = b[0] - a[0],
		y = b[1] - a[1];
		return Math.sqrt(x*x + y*y);
	},

	vec2len: function(a){
		var x = a[0],
		y = a[1];
		return Math.sqrt(x*x + y*y);
	},

	vec2normalize: function(a, out) {
		out = out || [0, 0];
		var x = a[0],
			y = a[1];
		var len = x*x + y*y;
		if (len > 0) {
			len = 1 / Math.sqrt(len);
			out[0] = a[0] * len;
			out[1] = a[1] * len;
		}
		return out;
	},

	vec2maxDir: function(a, out){
		out = out || [0, 0];
		var al0 = Math.abs(a[0]);
		var al1 = Math.abs(a[1]);

		if (al0 > al1){
			out[0] = a[0]/al0;
			out[1] = 0;
		}
		else{
			out[0] = 0;
			out[1] = a[1]/al1;
		}
		return out;
	},

	vec2scale: function(a, b, out){
		out = out || [0, 0];

		out[0] = a[0] * b;
		out[1] = a[1] * b;		

		return out;
	},

	vec2mul: function(a, b, out){
		out = out || [0, 0];

		out[0] = a[0] * b[0];
		out[1] = a[1] * b[1];		

		return out;
	},

	vec2confine: function(a, b, out){
		out = out || [0, 0];

		out[0] = (Math.abs(a[0]) < Math.abs(b[0])) ? a[0] : a[0]/Math.abs(a[0])*b[0];
		out[1] = (Math.abs(a[1]) < Math.abs(b[1])) ? a[1] : a[1]/Math.abs(a[1])*b[1];

		return out;
	},

	vec2clone: function(a, out){
		out = out || [0, 0];
		out[0] = a[0];
		out[1] = a[1];

		return out;	
	},

	edgePoints: function(){
		var bboxA = this.nodeA.bbox();
		var bboxB = this.nodeB.bbox();
		var confinmentA = [bboxA.width/2, bboxA.height/2];
		var confinmentB = [bboxB.width/2, bboxB.height/2];

		var path = [];
		var inset = this.properties.get('inset') || 1;
		var connectionDistance = this.properties.get('connectionDistance') || 1;
		var staticConnectionDistance = this.properties.get('staticConnectionDistance') || 1;

		var a = [bboxA.cx, bboxA.cy];
		var b = [bboxB.cx, bboxB.cy];

		var ab = this.vec2sub(b,a);

		var dirA = this.vec2maxDir(ab);

		var edgePointA = [0, 0];
		this.vec2mul(dirA, confinmentA, edgePointA);
		this.vec2sub(edgePointA, this.vec2scale(dirA, inset), edgePointA);
		var baseA = this.vec2clone(edgePointA);
		this.vec2add(a, edgePointA, edgePointA);

		//var edgeNodeA = this.vec2add(a, this.vec2confine(this.vec2scale(dirA, inset), confinmentA));
		path.push(edgePointA);
		path.push(this.vec2add(a, this.vec2add(baseA, this.vec2scale(dirA, connectionDistance))));
		this.vec2add(baseA, this.vec2scale(dirA, connectionDistance), baseA);
		path.push(this.vec2add(a, this.vec2add(baseA, this.vec2scale(dirA, staticConnectionDistance))));

		var ba = [ab[0]*-1, ab[1]*-1];
		var dirB = this.vec2maxDir(ba);

		var edgePointB = [0, 0];
		this.vec2mul(dirB, confinmentB, edgePointB);
		this.vec2sub(edgePointB, this.vec2scale(dirB, inset), edgePointB);
		var baseB = this.vec2clone(edgePointB);
		this.vec2add(b, edgePointB, edgePointB);

		//var edgeNodeB = this.vec2add(b, this.vec2confine(this.vec2scale(dirB, inset), confinmentB));
		baseBB = [0, 0];
		this.vec2add(baseB, this.vec2scale(dirB, connectionDistance), baseBB);
		path.push(this.vec2add(b, this.vec2add(baseBB, this.vec2scale(dirB, staticConnectionDistance))));
		path.push(this.vec2add(b, this.vec2add(baseB, this.vec2scale(dirB, connectionDistance))));
		path.push(edgePointB);
		
		this.$edgePoints = {
			nodeA: {
				point: new SVG.math.Point(edgePointA[0], edgePointA[1]),
				direction: dirA
			},
			nodeB: {
				point: new SVG.math.Point(edgePointB[0], edgePointB[1]),
				direction: dirB
			},
			path: path
		};

		return this.$edgePoints;
	},

	drawEdgeHandle: function(edge){
		var svg = edge.svg = edge.svg || this.graph.getPaintArea().group();
		var vec = [0,0];
		this.vec2scale(edge.direction, 30, vec);
		this.vec2add([edge.point.x, edge.point.y], vec, vec);
		var path = svg.path()
			.M(edge.point)
			.L(vec[0], vec[1])
			.stroke({
				fill: 'none',
				color: '#000',
				dasharray: '3 3',
				width: 1,

			});

		var handle = svg.circle(10)
			.center(vec[0], vec[1])
			.fill('#fff')
			.stroke({
				color: '#000',
			})
			.draggable({fn: function(p){
				var vec2 = [p.x, p.y];
				var edge2 = [edge.point.x, edge.point.y];
				var res = this.vec2add(
					this.vec2scale(
						this.vec2normalize(this.vec2sub(vec2, edge2)),
						30
					),
					edge2
				);
				return {x: res[0], y: res[1]};
			}.bind(this)});

		var bbox = this.nodeA.bbox();
		var edgeHandle = handle
			.clone()
			.addTo(svg)
			.center(edge.point.x, edge.point.y)
			.draggable({
				minX: bbox.x, 
				maxX: bbox.x + bbox.width,
				minY: bbox.y,
				maxY: bbox.y + bbox.height
			});

		edgeHandle.dragmove = function(delta, e){
			var vec = [0,0];
			this.vec2scale(edge.direction, 30, vec);
			handle.center(e.target.instance.cx() + vec[0], e.target.instance.cy() + vec[1]);
			console.log(e.target.instance.cx() + vec[0], e.target.instance.cy() + vec[1]);
		}.bind(this);

		svg.front();

		return this;
	},

	redrawShadowPath: function(){

		var edgePoints = this.edgePoints();

		this.pathPoints.length = 0;
		edgePoints.path.forEach(function(point){
			this.pathPoints.push(new SVG.math.Point(point[0], point[1]));
		}.bind(this));

		this.shadowPath
			.clear()
			.M.apply(this.shadowPath, edgePoints.path[0])
			.L.apply(this.shadowPath, edgePoints.path[2])
			.L.apply(this.shadowPath, edgePoints.path[3])
			.L.apply(this.shadowPath, edgePoints.path[5]);



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
			this.subpath.nodeA.forEach(function(subpath){
					subpath.svg.hide();
			});
		}
		if (this.path.nodeB){
			this.path.nodeB.svg.hide();
		}
		if (this.subpath.nodeB){
			this.subpath.nodeB.forEach(function(subpath){
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
			this.subpath.nodeA.forEach(function(subpath){
					subpath.svg.show();
			});
		}
		if (this.path.nodeB){
			this.path.nodeB.svg.show();
		}
		if (this.subpath.nodeB){
			this.subpath.nodeB.forEach(function(subpath){
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

		/* TODO: debug code */
		/*
		this.debug = this.debug || this.graph.getPaintArea().group();
		this.debug.clear();
		var edgePoints = this.edgePoints();
		edgePoints.nodeA.draw(this.debug);
		edgePoints.nodeB.draw(this.debug);
		this.debug.front();
		*/
		
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
		else{
			// remove the svg if it's not going to be used.
			this.path.nodeA.remove();	
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
		else{
			// remove the svg if it's not going to be used.
			this.path.nodeB.remove();	
		}
		return this;
	},



	drawArc: function(){
		
	},
		
	
	drawSublinks: function(){
		var maxLinkCount, lastSegment, offset, path, width;
		
		/** The sign will change the draw order */
		var draw = function(sublink, startPoint, path, sign){
			var index = 0;

			var updateColor = function(self, path){
				return function(response){
					this.updateBgColor(path, this.colormap.translate(response.value));
				}.bind(self);
			};
			
			while (offset >= -maxLinkCount / 2){
				var opts = {
					width: +width,
					linkCount: maxLinkCount
				};

				var currentSegment = this.calculateSublinkPath(path, offset * sign, opts);

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
			draw(this.subpath.nodeA, this.pathPoints[0], path, 1);
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
			draw(this.subpath.nodeB, this.pathPoints[5], path, -1);
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
			this.update();
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

	/** This is depricated */
	localUpdate: function(){
		console.log('localUpdate is depricated, please use update instead');
		
		if (!this.graph.options.batchUpdate)
			return this.update();
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
	debug: false,
	background: '#777',
	globalRefresh: true,
	refreshInterval: 300000,
	datasource: 'simulate',
	batchUpdate: true,
	colormap: 'flat5'
});
