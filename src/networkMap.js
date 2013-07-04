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
