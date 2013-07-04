networkMap.ColorLegend = new Class({
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

		var docSize = this.graph.getSVG().node.getSize();

		if (docSize.x && docSize.y){
			svg.move(
				docSize.x - this.options.boxSize - this.options.margin , 
				docSize.y - this.options.boxSize * colormap.length - this.options.margin
			);
		}
	}

});
