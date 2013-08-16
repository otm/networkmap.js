networkMap.Link = new Class({
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
