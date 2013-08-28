// svg.path.js 0.2 - Copyright (c) 2013 Nils Lagerkvist - Licensed under the MIT license

(function() {

	SVG.extend(SVG.Path, {
		M: function(p){
			p = (arguments.length === 1) ? [p.x, p.y] : Array.prototype.slice.call(arguments);

			this.addSegment('M', p, false);

			if (this._segments.length === 1){
				return this.plot('M' + p[0] + ' ' + p[1]);
			}

			return this;
		},
		m: function(p){
			p = (arguments.length === 1) ? [p.x, p.y] : Array.prototype.slice.call(arguments);

			this.addSegment('m', p, false);

			if (this._segments.length === 1){
				return this.plot('m' + p[0] + ' ' + p[1]);
			}

			return this;
		},
		// TODO: Solve
	  	L: function(p) {
	  		p = (arguments.length === 1) ? [p.x, p.y] : Array.prototype.slice.call(arguments);

  			return this.addSegment('L', p, this._redrawEnabled);
		},
		l: function(p) {
	  		p = (arguments.length === 1) ? [p.x, p.y] : Array.prototype.slice.call(arguments);

  			return this.addSegment('l', p, this._redrawEnabled);
		},
		H: function(x){
			return this.addSegment('H', [x], this._redrawEnabled);
		},
		h: function(x){
			return this.addSegment('h', [x], this._redrawEnabled);
		},
		V: function(y){
			return this.addSegment('V', [y], this._redrawEnabled);
		},
		v: function(y){
			return this.addSegment('v', [y], this._redrawEnabled);
		},
		C: function(p1, p2, p){
			p = (arguments.length === 3) ? [p1.x, p1.y, p2.x, p2.y, p.x, p.y] : Array.prototype.slice.call(arguments);

			return this.addSegment('C', p, this._redrawEnabled);
		},
		c: function(p1, p2, p){
			p = (arguments.length === 3) ? [p1.x, p1.y, p2.x, p2.y, p.x, p.y] : Array.prototype.slice.call(arguments);

			return this.addSegment('c', p, this._redrawEnabled);
		}, 
		S: function(p2, p){
			p = (arguments.length === 2) ? [p2.x, p2.y, p.x, p.y] : Array.prototype.slice.call(arguments);

			return this.addSegment('S', p, this._redrawEnabled);
		},
		s: function(p2, p){
			p = (arguments.length === 2) ? [p2.x, p2.y, p.x, p.y] : Array.prototype.slice.call(arguments);

			return this.addSegment('s', p, this._redrawEnabled);
		},
		// Q x1 y1, x y
		Q: function(p1, p){
			p = (arguments.length === 2) ? [p1.x, p1.y, p.x, p.y] : Array.prototype.slice.call(arguments);

			return this.addSegment('Q', p, this._redrawEnabled);
			var str = ', S' + p2.x + ' ' + p2.x + ', ' + p.x + ' ' + p.y
			return this.attr('d', this.attr('d') + str);
		},
		q: function(p1, p){
			p = (arguments.length === 2) ? [p1.x, p1.y, p.x, p.y] : Array.prototype.slice.call(arguments);

			return this.addSegment('q', p, this._redrawEnabled);
		},
		T: function(p){
			p = (arguments.length === 1) ? [p.x, p.y] : Array.prototype.slice.call(arguments);

  			return this.addSegment('T', p, this._redrawEnabled);
		},
		t: function(p){
			p = (arguments.length === 1) ? [p.x, p.y] : Array.prototype.slice.call(arguments);

  			return this.addSegment('t', p, this._redrawEnabled);
		},
		A: function(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, p){
			p = (arguments.length === 6) ? [rx, ry, xAxisRotation, largeArcFlag, sweepFlag, p.x, p.y] : Array.prototype.slice.call(arguments);

			return this.addSegment('A', p, this._redrawEnabled);
		},
		a: function(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, p){
			p = (arguments.length === 6) ? [rx, ry, xAxisRotation, largeArcFlag, sweepFlag, p.x, p.y] : Array.prototype.slice.call(arguments);
			
			return this.addSegment('a', p, this._redrawEnabled);
		},
		Z: function(){
			return this.addSegment('Z', [], this._redrawEnabled);
		},
		// TODO: Add check that first element is moveto
		addSegment: function(movement, coordinates, redraw){
			var segment = {
				type: movement,
				coords: coordinates
			};

			if (!this._segments){
				this._segments = [];
			}

			this._segments.push(segment);

			if (redraw !== false){
				this._drawSegment(segment);	
			}

			return this;
		},
		clear: function(){

			if (this._segments){
				this._segments.length = 0;
			}
			this._lastSegment = null;
			return this.plot();
		},
		getSegmentCount: function(){
			return this._segments.lenght;
		},
		getSegment: function(index){
			return this._segments[index];
		},
		removeSegment: function(index){
			this._segments.splice(index, 1);
			return this.redraw();
		},
		replaceSegment: function(index, segment){
			this._segments.splice(index, 1, segment);
			return this.redraw();
		},
		redraw: function(){
			// reset 
			this._lastSegment = null;
			this.attr('d', '');

			return this._drawSegment(this._segments);
		},
		_drawSegment: function(segment){
			var str = '', lastSegment = this._lastSegment;

			if (!Array.isArray(segment)){
				segment = [segment];
			}

			for (var i = 0; i < segment.length; i += 1){
				if (lastSegment === segment[i].type){
					str += ' ' + segment[i].coords.join(' ');
				}
				else{
					str += ' ' + segment[i].type + segment[i].coords.join(' ');
				}
				lastSegment = segment[i].type;
			}

			this._lastSegment = lastSegment;

			return this.attr('d', this.attr('d') + str);
		
		},
		line: function(line, options){
			var Point = networkMap.Point;
			if (options && options.reset){
				this.M(new Point(line.p1.x, line.p1.y));
			}
			else{
				this.L(new Point(line.p1.x, line.p1.y));
			}

			this.L(new Point(line.p2.x, line.p2.y));
			return this;
		}
	});	

}).call(this)