networkMap.ColorLegend = new Class({
	Implements: [Options],
	options: {
		/** The size of the the color square */
		boxSize: 25,
		/** margin */
		margin: 10
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

		this.graph.addEvent('resize', this.move.bind(this));

		this.draw();
	},

	/**
	 * Draw/redraw the legend in the graph
	 *
	 * @this {networkMap.ColorLegend}
	 * @return {networkMap.ColorLegend} self
	 */
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

		return this;
	},

	/**
	 * Move the legend to the x and y coordinate.
	 *
	 * @this {networkMap.ColorLegend}
	 * @return {networkMap.ColorLegend} self
	 * @todo clean up 
	 */
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
