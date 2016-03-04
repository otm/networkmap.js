networkMap.Link.Module = networkMap.Link.Module || {};

/**
 * The Edge module is an UI widget for controling
 * the edge point of the link.
 *
 * @param {object} options Options to override defaults.
 * @constructor
 * @borrows networkMap.Options#setOptions as #setOptions
 */
networkMap.Link.Module.Edge = function(svg, bbox, edgePoint, edgeDirection, userDefined){

	
	this.svg = svg;
	this.bbox = bbox;	
	
	this.defaults = {};
	this.setDefaults(edgePoint, edgeDirection);
		
	function convert(obj){
		return SVG.math.Point.create(obj.x, obj.y);	
	}
	
	if (userDefined){
		this.setUserDefined(convert(userDefined.point), convert(userDefined.pointer), convert(userDefined.direction));		
	}
	

	this.size = 15;
	this.angleSnap = Math.PI / 14;
	this.pointSnap = 5;

	this.state = this.states.hidden;
};

networkMap.extend(networkMap.Link.Module.Edge, networkMap.Options);
networkMap.extend(networkMap.Link.Module.Edge, networkMap.Observable);

/**
 * @lends networkMap.Link.Module.Edge
 */
networkMap.extend(networkMap.Link.Module.Edge, {
	setDefaults: function(edgePoint, edgeDirection){
		this.defaults.point = edgePoint;
		this.defaults.direction = edgeDirection; 
		
		return this;	
	},	
	
	getDefaults: function(){
		return this.defaults;
	},
	
	setUserDefined: function(edgePoint, edgePointer, edgeDirection){
		this.userDefined = {
			point: edgePoint,
			pointer: edgePointer,
			direction: edgeDirection
		};
		
		return this;
	},
	
	getUserDefined: function(){
		return this.userDefined;
	},
	
	getEdge: function(){
		return (this.userDefined) ? this.userDefined : this.defaults;
	},
	
	setBbox: function(bbox){
		this.bbox = bbox;
		
		return this.redraw();
	},
	
	getBbox: function(){
		return this.bbox;
	},
	
	show: function(bbox){
		this.state.show.call(this, bbox);
		return this;	
	},
	
	hide: function(){
		this.state.hide.call(this);
		return this;
	},

	redraw: function(){
		this.state.redraw.call(this);
		return this;	
	},

	getConfiguration: function(){
		return this.getUserDefined();
	},
	
	states: {
		hidden: {
			show: function(bbox){
				this.setBbox(bbox);

				var svg = this.svg;
				
				var edge = this.getEdge();
				
				var vec = edge.direction.clone().scale(30);
				vec.add(edge.point);		
						
				var line = this.line = svg.line(edge.point.x, edge.point.y, vec.x, vec.y)
					.stroke({
						fill: 'none',
						color: '#000',
						width: 2,
		
					});
		
				var directionHandle = this.directionHandle = this.svg.circle(this.size)
					.center(vec.x, vec.y)
					.fill('#fff')
					.stroke({
						color: '#000'
					})
					.draggable(function(x, y){
						var edge = this.getEdge();
						var vec2 = networkMap.vec2.create(x, y);
						var edge2 = edge.point.clone();
						var res = vec2.sub(edge2).normalize().scale(30);
						res.roundDir(this.angleSnap).add(edge2);
						
						return {x: res.x, y: res.y};
					}.bind(this));
				
				var radius = this.size / 2;
				var edgeHandle = this.edgeHandle = this.svg.circle(this.size)
					.fill('#fff')
					.stroke({
						color: '#000'
					})
					.center(edge.point.x, edge.point.y)
					.draggable(function(x, y){
						x = x < this.bbox.x - radius ? this.bbox.x - radius : x - x % this.pointSnap;
						x = x > (this.bbox.x + this.bbox.width - radius) ? this.bbox.x + this.bbox.width - radius : x - x % this.pointSnap;
						y = y < this.bbox.y - radius ? this.bbox.y - radius : y - y % this.pointSnap;
						y = y > (this.bbox.y + this.bbox.height - radius) ? this.bbox.y + this.bbox.height - radius : y - y % this.pointSnap;
						
						return {
							x: x,
							y: y
						};
					}.bind(this));
					
		
				svg.on('dblclick', this.onDoubleClick.bind(this));				
				
				directionHandle.on('dragstart', this.onDragStart.bind(this));
				directionHandle.on('dragmove', this.onDirectionHandleMove.bind(this));
				directionHandle.on('dragend', this.onDragEnd.bind(this));
				
				edgeHandle.on('dragstart', this.onDragStart.bind(this));
				edgeHandle.on('dragmove', this.onEdgeHandleMove.bind(this));
				edgeHandle.on('dragend', this.onDragEnd.bind(this));
				
				svg.front();
		
				this.state = this.states.rendered;
				return this;
			},

			redraw: function(){
				var edge = this.getEdge();
				
				if (edge.pointer){
					edge.point = SVG.math.Point.create(this.bbox.cx, this.bbox.cy).add(edge.pointer);	
				}
								
				return this;
			},

			hide: function(){
				return this;
			}
		},
		rendered: {
			show: function(bbox){
				this.bbox = bbox;
				return this.redraw();
			},
			
			redraw: function(){
				var edge = this.getEdge();
				
				if (edge.pointer){
					edge.point = SVG.math.Point.create(this.bbox.cx, this.bbox.cy).add(edge.pointer);	
				}
				var vec = edge.direction.clone().scale(30).add(edge.point);

				this.line.plot(edge.point.x, edge.point.y, vec.x, vec.y); 
				this.directionHandle.center(vec.x, vec.y);
				this.edgeHandle.center(edge.point.x, edge.point.y);
				return this;
			},
			
			hide: function(){
				this.directionHandle.dragmove = null;
				this.edgeHandle.dragmove = null;
				
				this.line.remove();
				this.directionHandle.remove();
				this.edgeHandle.remove();
				this.line = null;
				this.directionHandle = null;
				this.edgeHandle = null;
				
				this.state = this.states.hidden;
			}
			
		}	
	},

	onDoubleClick: function(){
		this.reset();
		this.fireEvent('dragend');
	},

	onDragStart: function(){
		this.fireEvent('dragstart');
	},
	
	onDragEnd: function(){
		this.fireEvent('dragend');
	},

	onDirectionHandleMove: function(event){
		var edge = this.getEdge();

		this.setUserDefined(
			edge.point,
			edge.point.clone().sub(SVG.math.Point.create(this.bbox.cx, this.bbox.cy)),
			SVG.math.Point.create(event.target.cx.baseVal.value, event.target.cy.baseVal.value)
				.sub(edge.point)
				.normalize()
		);
		
		this.redraw();
		this.fireEvent('updated');
	},
	
	onEdgeHandleMove: function(event){
		var edge = this.getEdge();
		var edgePoint = SVG.math.Point.create(event.target.cx.baseVal.value, event.target.cy.baseVal.value);
		
		this.setUserDefined(
			edgePoint,
			edgePoint.clone().sub(SVG.math.Point.create(this.bbox.cx, this.bbox.cy)),
			edge.direction
		);
		
		this.fireEvent('updated');
		this.redraw();
	},

	
	reset: function(){
		this.userDefined = undefined;
		this.redraw();
		
		return this;
	}
});
