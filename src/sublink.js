networkMap.SubLink = function(link, node, svg, options){
	this.link = link;
	this.node = node;
	this.svg = svg;

	this.primaryLink = null;
	this.memberLinks = [];
	this.utilizationLabelsConfiguration = null;
	this.utilizationLabel = null;
	this.pathPoints = null;
	
	this.initializeUtilizationLabel();
};


networkMap.extend(networkMap.SubLink, networkMap.Options);
networkMap.extend(networkMap.SubLink, networkMap.Observable);

networkMap.extend(networkMap.SubLink, {
	purge: function(){
		this.link = null;
		this.node = null;
		this.svg = null;
		
		this.primaryLink.purge();
		
		for (var i = 0, len = this.memberLinks.length; i < len; i++){
			this.memberLinks[i].purge();
		}
		this.memberLinks.lenght = 0;
		
		this.utilizationLabelsConfiguration = null;
		this.utilizationLabel = null;
		this.pathPoints = null;
	},	
	
	load: function(options){
		if (options.sublinks){
			this.loadMemberLinks(options.sublinks);	
		}
		
		this.loadPrimaryLink(options);
		
		return this;
	},
	
	loadPrimaryLink: function(options){
		this.primaryLink = new networkMap.PrimaryLink(
			this,
			networkMap.path(this.svg),
			options
		)
		.addEvent('change', function(){
			this.fireEvent('redraw');
		}.bind(this))
		.addEvent('requestHref', function(sublink){
			this.fireEvent('requestHref', [sublink]);
		}.bind(this));
		
		return this;
	},
	
	loadMemberLinks: function(memberLinks){
		for (var i = 0, len = memberLinks.length; i < len; i++){
			this.loadMemberLink(memberLinks[i]);
		}
		
		return this;		
	},
		
	loadMemberLink: function(memberLink){
		this.memberLinks.push(
			new networkMap.MemberLink(
				this, 
				networkMap.path(this.svg), 
				memberLink
			)
			.addEvent('change', this.redraw.bind(this))
			.addEvent('requestHref', function(sublink){
				this.fireEvent('requestHref', [sublink]);
			}.bind(this))
		);
		
		return this;
	},

	getConfiguration: function(){
		var configuration = this.primaryLink.getConfiguration();
		configuration.sublinks = [];		
		
		for (var i = 0, len = this.memberLinks.length; i < len; i++){
			configuration.sublinks.push(this.memberLinks[i].getConfiguration());
		}

		if (configuration.sublinks.length === 0)
			delete configuration.sublinks;		
		
		return configuration;
	},	
	
	draw: function(pathPoints, properties){
		// TODO: Remove hack
		this.pathPoints = pathPoints;
		
		this.primaryLink.draw(pathPoints, properties.get('width'), properties.get('arrowHeadLength'), this.memberLinks.length);
		
		for (var i = 0, len = this.memberLinks.length; i < len; i++){
			this.memberLinks[i].draw(pathPoints, properties.get('width'), properties.get('arrowHeadLength'), this.memberLinks.length, i);
		}
		
		this.setUtilizationLabelPosition();		
		
		return this;
	},	
	
	redraw: function(){
		return this;
	},
	
	setPath: function(pathPoints){
		this.pathPoints = pathPoints;
		
		return this;
	},
	
	hide: function(){
		this.primaryLink.hide();
		
		for (var i = 0, len = this.memberLinks.length; i < len; i++){
			this.memberLinks[i].hide();
		}

		this.utilizationLabel.hide();		
		
		return this;
	},
	
	show: function(){
		this.primaryLink.show();
		
		for (var i = 0, len = this.memberLinks.length; i < len; i++){
			this.memberLinks[i].show();
		}
		
		this.utilizationLabel.show();		

		return this;
	},
	
	initializeUtilizationLabel: function(){
		this.utilizationLabelConfiguration = networkMap.defaults(this.utilizationLabelsConfiguration, this.link.graph.properties.get('utilizationLabels'));
		
		this.utilizationLabel = new networkMap.renderer.link.UtilizationLabel(this.svg.group(), this.utilizationLabelsConfiguration);
		
		return this;
	},
	
	setUtilizationLabelPosition: function(){
		var center;
		var midpoint = new SVG.math.Line(this.pathPoints[2], this.pathPoints[3]).midPoint();
		
		center = new SVG.math.Line(this.pathPoints[2], midpoint).midPoint();
		this.utilizationLabel.setPosition(center.x, center.y).render();

		center = null;
		midpoint = null;
	
		return this;
	},
	
	setUtilizationLabelOptions: function(options){
		options = options || {};
		this.utilizationLabelConfiguration.enabled = (options.enabled === undefined) ? this.utilizationLabelConfiguration.enabled : options.enabled;
		this.utilizationLabelConfiguration.fontSize = options.fontSize || this.utilizationLabelConfiguration.fontSize;
		this.utilizationLabelConfiguration.padding = options.padding || this.utilizationLabelConfiguration.padding;
				
		this.utilizationLabel.setOptions(this.utilizationLabelConfiguration);
		this.setUtilizationLabel();
		
		return this;
	},
	
	setUtilizationLabel: function(value){
		if (value === undefined)
			value = this.getUtilization();
			
		this.utilizationLabel.render(value);
		
		return this;
	},
	
	hideUtilizationLabel: function(){
		this.utilizationLabel.hide();
		
		return this;
	},
	
	showUtilizationLabel: function(){
		this.utilizationLabel.show();
		
		return this;
	},

	updateHyperlinks: function(){		
		for (var i = 0, len = this.memberLinks.length; i < len; i++){
			this.memberLinks[i].updateHyperlink();
		}
		
		this.primaryLink.updateHyperlink();
		
		return this;
	},

	getLink: function(){
		return this.link;		
	},
	
	getNode: function(){
		return this.node;
	},
	
	getSibling: function(linkPath){
		if (linkPath instanceof networkMap.MemberLink){
			var mySibling = this.getLink().getSibling(this);
			
			if (this.memberLinks.length !== mySibling.memberLinks.length){
				return undefined;
			}
		
			var index = this.memberLinks.indexOf(linkPath);
			return mySibling.memberLinks[index];
		}
		
		if (linkPath instanceof networkMap.PrimaryLink){
			return this.getLink().getSibling(this).primaryLink;
		}
		
		return undefind;
	},	
	
	/**
	 *	Returns the primaryLink utilization. In case the primaryLink
	 * utilization is undefined the maximum utilization if the memberLinks
	 * is returned.
	 */
	getUtilization: function(){
		var max = null;
		
		var checkPath = function(value){
			// We are using the fact that 0 >= null => true
			if (value === null)
				return;
				
			if (value >= max){
				max = value;
			}	
		};	
		
		max = this.primaryLink.getUtilization();
		if (max === undefined || max === null){
			for (var i = 0, len = this.memberLinks.length; i < len; i++){
				checkPath(this.memberLinks[i].getUtilization());
			}	
		}
			
		checkPath = null;
		
		return max;
	}
});