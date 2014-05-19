networkMap.renderer.link = networkMap.renderer.Link || {};
networkMap.renderer.link.UtilizationLabel = function(svg, options){
	this.label = null;
	this.rect = null;
	this.svg = svg;
	
	this.value = null;

	options = options || {};
	this.cx = options.cx || null;
	this.cy = options.cy || null;
	delete options.cx;
	delete options.cy;
		
	this.options = {
		enabled: false,
		padding: 2,
		fontSize: 8,
		digits: 0
	};
	this.setOptions(options);
	
	this.state = this.states.notRendered;
};

networkMap.extend(networkMap.renderer.link.UtilizationLabel, networkMap.Options);
networkMap.extend(networkMap.renderer.link.UtilizationLabel, networkMap.Observable);

networkMap.extend(networkMap.renderer.link.UtilizationLabel, {
	NULL_STRING: '  -  ',
	
	setPosition: function(cx, cy){
		this.cx = cx;
		this.cy = cy;
		return this;
	},
	
	render: function(value){ return this.state.render.call(this, value); },
	hide: function(){ return this.state.hide.call(this); },
	show: function(){ return this.state.show.call(this); },
	purge: function(){ return this.state.purge.call(this); },
	
	states: {
		notRendered: {
			render: function(value){
				if (!this.svg)
					return this;
				
				if (!this.options.enabled){
					return this;
				}

				value = value || this.value;
				
				var bgColor = '#ffffff', 
					strokeColor = '#000000',
					strokeWidth = 1;				
				
				var svg = this.svg;
	
				var label = this.label = svg.text(this.NULL_STRING)
				.font({
					family:   this.options.fontFamily,
					size:     this.options.fontSize,
					anchor:   'start',
					leading:  this.options.fontSize
				})
				.move(parseFloat(this.options.padding), parseFloat(this.options.padding));
				
				var bboxLabel = label.bbox();		
				var rect = this.rect = svg.rect(1,1)
					.fill({ color: bgColor})
					.stroke({ color: strokeColor, width: strokeWidth })
					.attr({ 
						rx: 2,
						ry: 2
					})
					.size(
						bboxLabel.width + this.options.padding * 2, 
						bboxLabel.height + this.options.padding * 2
					);
				label.front();
				
				this.state = this.states.rendered;
				this.render(value);
				return this;
			},
			hide: function(){
				return this;
			},
			show: function(){
				return this;
			},
			purge: function(){
				return this;	
			}
		},
		rendered: {
			render: function(value){
				value = this.value = value || this.value;
				
				value = (value === null) ? null : value * 100;
				if (!this.options.enabled || this.cx === null || this.cy === null){
					this.hide();
					return this;
				}
				
				this.show();
				
				if (value === null)
					this.label.text(this.NULL_STRING);	
				else		
					this.label.text(((value < 10) ? ' ' : '') + value.toFixed(this.options.digits) + '%');
					
				this.label.font({
					family:   this.options.fontFamily,
					size:     this.options.fontSize,
					leading:  this.options.fontSize
				})
				.move(parseFloat(this.options.padding), parseFloat(this.options.padding));
				
				var bboxLabel = this.label.bbox();	
				this.rect.size(
					bboxLabel.width + this.options.padding * 2, 
					bboxLabel.height + this.options.padding * 2
				);
				
				this.svg.center(parseFloat(this.cx), parseFloat(this.cy));	
				this.svg.front();
				return this;
				
			},
			hide: function(){
				this.svg.hide();
				this.state = this.states.hidden;
				
				return this;
			},
			show: function(){
				return this;
			},
			purge: function(node){}
		},
		hidden: {
			render: function(value){
				if (this.options.enabled){
					return this.show();
				}
				
				this.value = value;
				return this;
			},
			hide: function(){
				return this;
			},
			show: function(){
				this.svg.show();
				this.state = this.states.rendered;
				return this.render();			
			},
			purge: function(node){}
		}
		
	}

});