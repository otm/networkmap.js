
networkMap.LinkPath = function(link, svg, options){
	// this.options = {};
	// this.setOptions(options);
	this.properties = new networkMap.Properties(options, link.properties);
	this.properties.addEvent('change', function(change){
		this.fireEvent('change', change);
	}.bind(this));

	this.link = link;
	this.svg = svg;
	
	// Check if we should setup an update event
	if (this.properties.get('requestUrl')) {
		this.link.registerUpdateEvent(
			this.properties.get('datasource'),
			this.properties.get('requestUrl'),
			this,
			function(response){
				this.link.updateBgColor(this, this.link.colormap.translate(response.value));
			}.bind(this)
		);
	}
	
	this.setupEvents();
};

networkMap.extend(networkMap.LinkPath, networkMap.Options);
networkMap.extend(networkMap.LinkPath, networkMap.Observable);
networkMap.extend(networkMap.LinkPath, {	
	remove: function(){
		this.svg.remove();
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


	/**
	 * This will create/update a link tag for the
	 * link. Order of presence is:
	 * - options.href
	 * - emit url event
	 *
	 * @this {networkMap.Link}
	 * @return {networkMap.Link} self
	 */
	updateLink: function(){
		var href = this.properties.get('href');
		if (href){
			if (networkMap.isFunction(href))
				this.setLink(href(this));
			else
				this.setLink(href);
			return this;
		}
		
		this.fireEvent('requestHref', [this]);
		return this;
	},

	/**
	 * This will create/update the link to
	 * the specified URL.
	 *
	 * @param {string} The URL
	 * @this {networkMap.Link}
	 * @return {networkMap.Link} self
	 * @TODO: Add functionality to remove the link
	 */
	setLink: function(url){
		if (url){
			if (this.a){
				this.a.to(url);
				return this;
			}

			if (this.svg.parent){
				this.a = this.svg.linkTo(url);
			}
			
			return this;
		}
		
		return this;						
	},	
	
	getLink: function(){
		return this.link;
	},
	/**
	 * Get the node which is assosiated to the linkPath
	 *
	 * @retrun {networkMap.Node} The node which this is assosiated with.
	 */
	getNode: function(){
		return this.getLink().getNode(this);
	},
	getSettingsWidget: function(){
		return this.getLink().getSettingsWidget();
	},
	getProperty: function(key){
		return this.properties.get(key);
		/* TODO: Remove
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
		*/
	},
	setProperty: function(key, value){
		if (key == 'width'){
			var link = this.getMainPath();
			if (link != this){
				return link.setProperty(key, value);
			}
		}
				
		this.properties.set(key, value);
		//TODO: Remove
		//this.options[key] = value;
		this.fireEvent('change', [key]);
		return this;
	},
	getConfiguration: function(){
		return this.properties.extract();
	},
	getMainPath: function(){
		var link;
		
		if (this.link.subpath.nodeA){
			this.link.subpath.nodeA.forEach(function(sublink){
				if (this == sublink){
					link = this.link.path.nodeA;
				}
			}.bind(this));
			
			if (link){
				return link;
			}		
		}
		
		if (this.link.subpath.nodeB){
			this.link.subpath.nodeB.forEach(function(sublink){
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
		
		if (this.properties.get('events')){
			if (this.properties.get('events.click')){
				this.svg.attr('cursor', 'pointer');
			}

			if (this.properties.get('events.hover')){
				this.svg.on('mouseover', this._hoverHandler.bind(this));
				this.svg.on('mouseout', this._hoverHandler.bind(this));
			}
		}
	},
	_clickHandler: function(e){
		if (this.link.mode() === 'normal' && this.properties.get('events.click')){
			networkMap.events.click(e, this);
		}
		else if (this.link.mode() === 'edit'){
			e.preventDefault();

			this.link.graph.publish('edit', [this.link.configurationWidget.toElement(this.link, this.link.properties)]);
		}
	},
	_hoverHandler: function(e){
		if (this.link.mode() === 'edit'){
			return;
		}
		
		if (e.type === 'mouseover'){
			networkMap.events.mouseover(e, this);
		}
		if (e.type === 'mouseout'){
			networkMap.events.mouseout(e, this);
		}
	}
});
