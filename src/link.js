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
			this.debug = this.graph.getPaintArea().group();
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
		var svg = this.svg = this.graph.getPaintArea().group();
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
			this.redrawShadowPath();
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
		
		// TODO: this needs to be handled properly!!!
		if (!this.options.nodeA.requestUrl || !this.options.nodeB.requestUrl)
			return;

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
		
		if (this.options.nodeA.events){
			this.svgEl.nodeA.mainPath.link = this.options.nodeA.events;
				
			if (this.options.nodeA.events.click){
				this.svgEl.nodeA.mainPath.on('click', networkMap.events.click);
				this.svgEl.nodeA.mainPath.attr('cursor', 'pointer');
			}
			if (this.options.nodeA.events.hover){
				this.svgEl.nodeA.mainPath.on('mouseover', networkMap.events.mouseover);
				this.svgEl.nodeA.mainPath.on('mouseout', networkMap.events.mouseout);
			}
		}
		
		/***** mainPath2 ****/
		
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
		
		if (this.options.nodeB.events){
			this.svgEl.nodeB.mainPath.link = this.options.nodeB.events;
				
			if (this.options.nodeB.events.click){
				this.svgEl.nodeB.mainPath.on('click', networkMap.events.click);
				this.svgEl.nodeB.mainPath.attr('cursor', 'pointer');

			}
			
			if (this.options.nodeB.events.hover){
				this.svgEl.nodeB.mainPath.on('mouseover', networkMap.events.mouseover);
				this.svgEl.nodeB.mainPath.on('mouseout', networkMap.events.mouseout);

			}
		}


		return this;
	},
	drawSublinks: function(){
		var maxLinkCount, lastSegment, offset, path, width;
		
		var draw = function(nodeOptions, node, startPoint, path){
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
							nodeOptions.sublinks[sublink].requestUrl,
							nodeOptions.sublinks[sublink].requestData, 
							//this.options.nodeB.requestUrl, 
							//this.options.nodeB.requestData,
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

					if (nodeOptions.sublinks[sublink].events){
						node.sublinks[sublink].link = nodeOptions.sublinks[sublink].events;
							
						if (nodeOptions.sublinks[sublink].events.click){
							node.sublinks[sublink].on('click', networkMap.events.click);
							node.sublinks[sublink].attr('cursor', 'pointer');
						}
						if (nodeOptions.sublinks[sublink].events.hover){
							node.sublinks[sublink].on('mouseover', networkMap.events.mouseover);
							node.sublinks[sublink].on('mouseout', networkMap.events.mouseout);
						}
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
			draw(this.options.nodeA, this.svgEl.nodeA, this.pathPoints[0], path);
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
			draw(this.options.nodeB, this.svgEl.nodeB, this.pathPoints[5], path);
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
			path.fill(this.options.background);
		}
		else{
			path.fill(color);
		}
	}


});
