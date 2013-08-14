networkMap.LinkPath = new Class ({
	Implements: [Options, Events],
	options: {},
	svg: null,
	initialize: function(link, svg, options){
		this.setOptions(options);
		this.link = link;
		this.svg = svg;
		
		this.link.registerUpdateEvent(
			link.options.datasource,
			this.options.requestUrl,
			this,
			function(response){
				this.link.updateBgColor(this, this.link.options.colormap.translate(response.value));
			}.bind(this)
		);
		this.setupEvents();
	},
	getEditables: function(){
		var editables = {
			width: {
				label: 'Local width',
				type: 'int'	
			}	
		};
		
		return editables;		
	},
	getLink: function(){
		return this.link;
	},
	getProperty: function(key){
		if (key == 'width'){
			var link = this.getMainPath();
			if (link != this){
				return link.getProperty(key);
			}
			else if (!this.options[key]){
				return this.link.options[key];
			}
		}
		
		if (!this.options[key]){
			return null;
		}
		
		return this.options[key];
	},
	setProperty: function(key, value){
		if (key == 'width'){
			var link = this.getMainPath();
			if (link != this){
				return link.setProperty(key, value);
			}
		}
				
		this.options[key] = value;
		this.fireEvent('change', [key]);
		return this;
	},
	getConfiguration: function(){
		return this.options;
	},
	getMainPath: function(){
		var link;
		
		if (this.link.subpath.nodeA){
			this.link.subpath.nodeA.each(function(sublink){
				if (this == sublink){
					link = this.link.path.nodeA;
				}
			}.bind(this));
			
			if (link){
				return link;
			}		
		}
		
		if (this.link.subpath.nodeB){
			this.link.subpath.nodeB.each(function(sublink){
				if (this == sublink){
					link = this.link.path.nodeB;
				}
			}.bind(this));
			
			if (link){
				return link;
			}		
		}
		
		return this;
		
	},
	setupEvents: function(){
		this.svg.on('click', this._clickHandler.bind(this));
		
		if (this.options.events){
			if (this.options.events.click){
				this.svg.attr('cursor', 'pointer');
			}

			if (this.options.events.hover){
				this.svg.on('mouseover', this._hoverHandler.bind(this));
				this.svg.on('mouseout', this._hoverHandler.bind(this));
			}
		}
	},
	_clickHandler: function(e){
		if (this.link.mode() === 'normal' && this.options.events && this.options.events.click){
			networkMap.events.click(e, this);
		}
		else if (this.link.mode() === 'edit'){
			this.link.graph.settings.edit(this);	
		}
	},
	_hoverHandler: function(e){
		networkMap.events.mouseover(e, this);
	}
});
