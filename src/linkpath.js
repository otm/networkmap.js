
networkMap.LinkPath = function(subLink, svg, options){
	this.properties = new networkMap.Properties(options, subLink.properties);
	this.properties.addEvent('change', function(change){
		this.fireEvent('change', change);
	}.bind(this));

	this.subLink = subLink;
	this.mediator = this.getLink().graph;
	this.svg = svg;
	this.value = null;
	
	// Hide the SVG node in case we will not use it
	// otherwise it will affect the BBOX calculation
	svg.hide();
	this.setupEvents();
};

networkMap.extend(networkMap.LinkPath, networkMap.Options);
networkMap.extend(networkMap.LinkPath, networkMap.Observable);
networkMap.extend(networkMap.LinkPath, {	
	purge: function(){
		return this;
	},

	hide: function(){
		this.svg.hide();
		
		return this;
	},
	
	show: function(){
		this.svg.show();
		
		return this;
	},

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
	updateHyperlink: function(){
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

	updateBgColor: function(color){
		if (!color){
			this.svg.fill(this.options.background);
			return this;
		}
		
		this.svg.fill(color);
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
	
	isDrawable: function(){
		return this.properties.get('requestData') !== undefined && this.properties.get('requestUrl') !== undefined;
	},
	
	getCenter: function(){
		var bbox = this.svg.bbox();
			
		return {
			cx: bbox.x + bbox.height / 2,
			cy: bbox.y + bbox.width / 2
		};	
	},
	
	
	getSubLink: function(){
		return this.subLink;
	},
	
	getLink: function(){
		return this.getSubLink().getLink();
	},
	/**
	 * Get the node which is assosiated to the linkPath
	 *
	 * @retrun {networkMap.Node} The node which this is assosiated with.
	 */
	getNode: function(){
		return this.getSubLink().getNode();
	},
	
	getSibling: function(){
		return undefined;
	},	
	
	getSettingsWidget: function(){
		return this.getLink().getSettingsWidget();
	},
	
	getUtilization: function(){
		return this.value;
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
		
		// Check if we should setup an update event
		if (this.properties.get('requestUrl')) {
			this.getLink().registerUpdateEvent(
				this.getLink().properties.get('datasource'),
				this.properties.get('requestUrl'),
				this,
				function(response){
					// Refactor
					this.value = response.value;
					this.updateBgColor(this.getLink().colormap.translate(response.value));
					
					// update utilization label
					this.getSubLink().setUtilizationLabel();
				}.bind(this)
			);
		}
	},
	
	
	
	_clickHandler: function(e){
		// TODO: Move this logic to the link by sending an event 
		if (this.getLink().mode() === 'normal' && this.properties.get('events.click')){
			networkMap.events.click(e, this);
		}
		else if (this.getLink().mode() === 'edit'){
			e.preventDefault();
			
			// TODO: This is temporary code to test a feature
			this.getLink().drawEdgeHandles();
			
			this.mediator.publish('edit', [new networkMap.event.Configuration({
				deletable: true,
				destroy: function(){
					// TODO: Refacor with an event
					this.getLink().graph.removeLink(this.getLink()); 
				}.bind(this),
				cancel: function(){
					this.getLink().hideEdgeHandles();
				}.bind(this),
				editable: true,
				editWidget: this.getLink().configurationWidget.toElement(this.getLink(), this.getLink().properties),
				target: this,
				type: 'link',
				targetName: this.properties.get('name')
			})]);
		}
	},
	
	_hoverHandler: function(e){
		if (this.getLink().mode() === 'edit'){
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

networkMap.PrimaryLink = function(link, svg, options){
	networkMap.LinkPath.call(this, link, svg, options);	
};

networkMap.PrimaryLink.prototype = Object.create(networkMap.LinkPath.prototype);
networkMap.PrimaryLink.constructor = networkMap.PrimaryLink;

networkMap.extend(networkMap.PrimaryLink, {
	getSibling: function(){
		return this.getSubLink().getSibling(this);
	},
	
	draw: function(pathPoints, width, arrowHeadLength, memberLinkCount){
		if (!this.isDrawable())
			return this;		
		
		if (memberLinkCount === 0){
			return this.drawFullPath(pathPoints, width, arrowHeadLength, memberLinkCount);	
		}
		
		if (memberLinkCount > 0){
			return this.drawShortPath(pathPoints, width, arrowHeadLength, memberLinkCount);		
		}
		
		throw "Invalid member link count";
	},	
	
	drawFullPath: function(pathPoints, width, arrowHeadLength, memberLinkCount){
		this.svg.show();
		memberLinkCount = memberLinkCount || 1;

		var firstSegment = new SVG.math.Line(pathPoints[0], pathPoints[2]);
		var midSegment = new SVG.math.Line(pathPoints[2], pathPoints[3]);

		// perpendicular line with last point in firstList
		var helpLine1 = firstSegment.perpendicularLine(pathPoints[1], memberLinkCount * width);
		var helpLine2 = firstSegment.perpendicularLine(pathPoints[2], memberLinkCount * width);
		var helpLine3 = midSegment.perpendicularLine(pathPoints[2], memberLinkCount * width);
		
		var midPoint = midSegment.midPoint();
		var helpPoint1 = midSegment.move(midPoint, midSegment.p1, arrowHeadLength);
		var helpPoint2 = midSegment.move(midPoint, midSegment.p2, arrowHeadLength);
		
		var helpLine4 = midSegment.perpendicularLine(helpPoint1, memberLinkCount * width);

		// find intersection point 1
		var helpLine5 = new SVG.math.Line(helpLine1.p1, helpLine2.p1);
		var helpLine6 = new SVG.math.Line(helpLine3.p1, helpLine4.p1);
		var intersectPoint1 = helpLine6.intersection(helpLine5);

		if (intersectPoint1.parallel === true){
			intersectPoint1 = helpLine1.p1;
		}

		// find intersection point 2
		helpLine5 = new SVG.math.Line(helpLine1.p2, helpLine2.p2);
		helpLine6 = new SVG.math.Line(helpLine3.p2, helpLine4.p2);
		var intersectPoint2 = helpLine6.intersection(helpLine5);

		if (intersectPoint2.parallel === true){
			intersectPoint2 = helpLine1.p2;
		}
		
		this.svg.clear();
		
		this.svg
			.M(pathPoints[0])
			.L(helpLine1.p1).L(intersectPoint1).L(helpLine4.p1)
			.L(midPoint)
			.L(helpLine4.p2).L(intersectPoint2).L(helpLine1.p2)
			.Z().front();
		
		return this;
	},

	drawShortPath: function(pathPoints, width, arrowHeadLength, memberLinkCount){		
		this.svg.show();
		var midSegment = new SVG.math.Line(pathPoints[2], pathPoints[3]);
		
		var midPoint = midSegment.midPoint();
		var helpPoint1 = midSegment.move(midPoint, midSegment.p1, arrowHeadLength);
		
		var helpLine4 = midSegment.perpendicularLine(helpPoint1, memberLinkCount * width / 2);
		
		var startPoint = new SVG.math.Line(pathPoints[2], midPoint).midPoint();
		var helpLine7 = midSegment.perpendicularLine(
			startPoint, 
			memberLinkCount * width / 2
		);

		this.svg.clear();
		
		this.svg
			.M(startPoint)
			.L(helpLine7.p1).L(helpLine4.p1)
			.L(midPoint)
			.L(helpLine4.p2).L(helpLine7.p2)
			.Z().front();
			
		return this;
	}

});









networkMap.MemberLink = function(link, svg, options){
	networkMap.LinkPath.call(this, link, svg, options);
};

networkMap.MemberLink.prototype = Object.create(networkMap.LinkPath.prototype);
networkMap.MemberLink.constructor = networkMap.MemberLink;

networkMap.extend(networkMap.MemberLink, {
	getSibling: function(){	
		return this.getSubLink().getSibling(this);		
	},
	
	draw: function(pathPoints, width, arrowHeadLength, memberLinkCount, position){
		return this.drawSublink(pathPoints, width, arrowHeadLength, memberLinkCount, position);
	},
	
	drawSublink: function(pathPoints, width, arrowHeadLength, memberLinkCount, position){
		this.svg.show();
		
		// This is needed to draw one side of the links in reverse order
		var sign = (SVG.math.angle(pathPoints[0], pathPoints[1]) < Math.PI) ? 1 : -1;
		
		var offset = -memberLinkCount / 2 + position;
		
		var path = [
			pathPoints[0],
			pathPoints[1],
			pathPoints[2],
			new SVG.math.Line(pathPoints[2], pathPoints[3]).midPoint()
		];


		var lastSegment = this.calculateSublinkPath(path, width, arrowHeadLength, memberLinkCount, sign * offset);		
		var currentSegment = this.calculateSublinkPath(path, width, arrowHeadLength, memberLinkCount, sign * (offset + 1));

		var startPoint = pathPoints[0];
			
		this.svg.clear();

		// Special case when we are ploting a odd number
		// of sublinks. We must add the middlepoint manually
		if (offset === -0.5){
			this.svg
				.M(startPoint)
				.L(lastSegment[0]).L(lastSegment[1]).L(lastSegment[2])
				.L(path[path.length - 1])
				.L(currentSegment[2]).L(currentSegment[1]).L(currentSegment[0])
				.Z().back();
		}
		else{
			this.svg
				.M(startPoint)
				.L(lastSegment[0]).L(lastSegment[1]).L(lastSegment[2])
				.L(currentSegment[2]).L(currentSegment[1]).L(currentSegment[0])
				.Z().back();
		}

		return this;
	},
	
	calculateSublinkPath: function(path, width, arrowHeadLength, memberLinkCount, offset){
		
		var angle = Math.atan2(arrowHeadLength, Math.abs(width * memberLinkCount / 2));
		var localArrowHeadLength = Math.abs(width * offset * Math.tan(angle)); 

		var firstSegment = new SVG.math.Line(path[0], path[2]);
		var midSegment = new SVG.math.Line(path[2], path[3]);

		// perpendicular line with last point in firstList
		var helpLine1 = firstSegment.perpendicularLine(path[1], width * offset);
		var helpLine2 = firstSegment.perpendicularLine(path[2], width * offset);
		var helpLine3 = midSegment.perpendicularLine(path[2], width * offset);

		// find the arrowhead distance
		var arrowHeadInset = midSegment.move(midSegment.p2, midSegment.p1, localArrowHeadLength);
		var arrowHeadStart = midSegment.perpendicularLine(arrowHeadInset, width * offset);

		// find intersection point 1
		var helpLine5 = new SVG.math.Line(helpLine1.p1, helpLine2.p1);
		var helpLine6 = new SVG.math.Line(helpLine3.p1, arrowHeadStart.p1);
		var intersectPoint1 = helpLine6.intersection(helpLine5);

		if (intersectPoint1.parallel === true){
			intersectPoint1 = helpLine1.p1;
		}

		return [
			helpLine1.round(2).p1,
			intersectPoint1.round(2),
			arrowHeadStart.round(2).p1
		];
	}
});
