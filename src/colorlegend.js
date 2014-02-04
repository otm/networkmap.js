networkMap.ColorLegend = new Class({
	Implements: [Options],
	options: {
		/** The size of the the color square */
		boxSize: 25,
		/** margin */
		margin: 10,
		/** target */
		target: null
	},

	/** The graph object to attach to */
	graph: null,
	
	/**
	 * Creates an instance of networkMap.ColorLegend.
	 *
	 * @constructor
	 * @this {networkMap.ColorLegend}
	 * @param {string} The name of the colormap
	 * @param {Object} A options object.
	 */
	initialize: function(colormap, options){
		this.graph = options.graph;
		delete options.graph;

		this.setOptions(options);
		this.colormap = networkMap.colormap[colormap];

		if (!this.colormap){
			throw 'Colormap "' + colormap + '" is not registerd';
		}

		this.draw();
		
		// Fix for FF 
		// A timing issue seems to cause the bbox to
		// return an incorrect value
		(function(){
			var bbox = this.svg.bbox();
			if (bbox.x === 0 && bbox.y === 0){
				return this;
			}
			this._move();
		}.bind(this)).delay(0);
	},

	/**
	 * Draw/redraw the legend in the graph
	 *
	 * @this {networkMap.ColorLegend}
	 * @return {networkMap.ColorLegend} self
	 */
	draw: function(){
		var colormap = this.colormap.map;

		var container = this.container = new Element('div', {class: 'nm-colormap'}).inject(this.options.target);
		var svg = this.svg = SVG(container).group();

		

		colormap.each(function(color, index){
			svg.rect(this.options.boxSize, this.options.boxSize).attr({
				fill: color,
				'stroke-width': 1
			}).move(
				0, 
				(colormap.length - 1 - index) * this.options.boxSize
			);

			svg.line(
				-5, (colormap.length - 1 - index) * this.options.boxSize,
				0, (colormap.length - 1 - index) * this.options.boxSize
			).attr({
				stroke:'#000'

			});

			svg.text(Math.round(this.colormap.limits[index].toString() * 100) + '%')
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
		
		this._move();

		return this;
	},

	/**
	 * Move the legend and resize the containing div
	 *
	 * @this {networkMap.ColorLegend}
	 * @return {networkMap.ColorLegend} self
	 */
	_move: function(){
		var bbox = this.svg.bbox();
		
		this.container.setStyles({
			width: bbox.width,
			height: bbox.height	
		});
		this.svg.move(Math.abs(bbox.x), Math.abs(bbox.y));

		return this;
	}

});
