// svg.path.js 0.2 - Copyright (c) 2013 Nils Lagerkvist - Licensed under the MIT license

(function(){


	SVG.math = {
		angle: function(p1, p2, p3){
			if (p3){
				return Math.abs(SVG.math.angle(p1, p3) - SVG.math.angle(p2, p3));
			}

			var angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

			while (angle < 0){
				angle += 2 * Math.PI;
			}

			return angle;
		},

		rad: function(degree){
			return degree * Math.PI / 180;
		},

		deg: function(radians){
			return radians * 180 / Math.PI;
		},

		snapToAngle: function(angle, directions){
			var minDiff = 100,
				diff,
				i,
				length;

			// Find the smallest value in the array and add 2*PI to it
			directions.push(Math.min.apply( Math, directions ) + 2 * Math.PI);

			length = directions.length;

			while (angle > 2 * Math.PI){
				angle -= 2 * Math.PI;
			}

			while (angle < 0){
				angle += 2 * Math.PI;
			}

			for (i = 0; i < length; i += 1){
				diff = Math.abs(angle - directions[i]);
				if (diff > minDiff){
					return directions[i-1];
				}
				minDiff = diff;
			}

			// This is a special case when we match on the smallest angle + 2*PI
			return directions[0];
		},

		// linear interpolation of two values
		lerp: function(a, b, x) {
			return a + x * (b - a);
		}

	};
	
	

	SVG.math.Point = function Point(x, y){
		this.x = parseFloat(x);
		this.y = parseFloat(y);
	};

	SVG.extend(SVG.math.Point, {
		round: function(precision){
			this.x = this.x.round(precision);
			this.y = this.y.round(precision);
			return this;
		}	
	});

	SVG.math.Point.attr = {
		stroke: '#000',
		fill: 'none',
		radius: 5
	};

	SVG.extend(SVG.math.Point, {
		draw: function(svg, options){
			if (svg){
				attr = options || SVG.math.Point.attr;
				options = options || {};
				var radius = attr.radus || 5;
				delete attr.radius;

				this.svg = svg;
				this.circle = svg.circle(radius).attr(options).move(this.x, this.y);
			}
			else if (this.circle){
				this.circle.remove();
				delete this.svg;
				delete this.circle;
			}

			return this;
		}
	});

	SVG.math.Line = function Line(p1, p2){
		this.update(p1, p2);
	};

	SVG.math.Line.attr = {
		stroke: '#000',
		fill: 'none'
	};

	SVG.extend(SVG.math.Line, {
		update: function(p1, p2){               
			this.p1 = p1;
			this.p2 = p2;		
        
            this.a = this.p2.y - this.p1.y;
            this.b = this.p1.x - this.p2.x;

            this.c = p1.x * p2.y - p2.x * p1.y; 

            return this;
		},
		draw: function(svg, options){
			if (svg){
				attr = attr || SVG.math.Line.attr;
				this.svg = svg;
				this.line = svg.line(p1.x, p1.y, p2.x, p2.y).attr(options);
			}
			else if (this.line){
				this.line.remove();
				delete this.svg;
				delete this.line;
			}

			return this
		},
		parallel: function(line){
			return (this.a * line.b - line.a * this.b) === 0;			
		},
		
		round: function(precision){
			this.p1.x = this.p1.x.round(precision);
			this.p1.y = this.p1.y.round(precision);

			this.p2.x = this.p2.x.round(precision);
			this.p2.y = this.p2.y.round(precision);

			return this;
		},

		move: function(from, towards, distance){
			var sign = (from.x > towards.x) ? -1 :
    			from.x < towards.x ? 1 : 
    			from.y > towards.y ? -1 : -1; // The special case when from.x == towards.x

			var theta = Math.atan((this.p1.y - this.p2.y) / (this.p1.x - this.p2.x));
			var dy = distance * Math.sin(theta);
			var dx = distance * Math.cos(theta);
			return new SVG.math.Point(
				from.x + sign * dx, 
				from.y + sign * dy
			);
		},

		intersection: function(line){
			var det = this.a * line.b - line.a * this.b;

			var point = new SVG.math.Point(
				(line.b * this.c - this.b * line.c) / det,
				(this.a * line.c - line.a * this.c) / det
			);
			point.parallel = (det === 0);
			return point;
		},
		
		midPoint: function(){
			return this.interpolatedPoint(0.5);
		},

		segmentLengthSquared: function() {
			var dx = this.p2.x - this.p1.x;
			var dy = this.p2.y - this.p1.y;
			return dx * dx + dy * dy;
		},

		closestLinearInterpolation: function(p) {
			var dx = this.p2.x - this.p1.x;
			var dy = this.p2.y - this.p1.y;

			return ((p.x - this.p1.x) * dx + (p.y - this.p1.y) * dy) /
				this.segmentLengthSquared();
		},

		interpolatedPoint: function(t) {
			return {
				x: SVG.math.lerp(this.p1.x, this.p2.x, t),
				y: SVG.math.lerp(this.p1.y, this.p2.y, t)
			};
		},

		closestPoint: function(p) {
  			return this.interpolatedPoint(
      			this.closestLinearInterpolation(p)
      		);
		},

		perpendicularLine: function(p, distance){
			var dx = this.p1.x - this.p2.x;
			var dy = this.p1.y - this.p2.y;

			var dist = Math.sqrt(dx*dx + dy*dy);
			dx = dx / dist;
			dy = dy / dist;

			return new SVG.math.Line(
				new SVG.math.Point(
					p.x + distance * dy,
					p.y - distance * dx
				),
				new SVG.math.Point(
					p.x - distance * dy,
					p.y + distance * dx
				)
			);
		}

	});

})();