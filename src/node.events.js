/**
 * Register global event handlers. These can be over ridden on the 
 * networkMap instance and on the node instance.
 *
 * @param {string} The event name (click, mouseover, mouseout, hover)
 * @param {function} The value to set
 * @this {???}
 * @return {???}
 */
networkMap.Node.registerEvent = function(name, f){
	if (name === 'hover'){
		return this.registerHover(f);
	}

	if (!networkMap._events[name])
		throw "Invalid event: " + name;
		
	networkMap._events[name] = f;
};

networkMap.Node.registerEvent.registerHover = function(f){
	
	/** default mouseover event
	 * By overriding this function the hover 
	 * will stop working event 
	 */
	var mouseover = function(e, options, hover){
		var el = document.id('nm-active-hover');
		var id = e.target.instance.attr('id');
		
		if (el){
			if (el.retrieve('id') === e.target.instance.attr('id')){
				el.store('keep', true);
				return;
			}
			
			el.destroy();	
		}
		
		el = new Element('div', {
			'id': 'nm-active-hover',
			'class': 'nm-hover',
			events: {
				mouseover: function(){
					el.store('mouseover', true);
				},
				mouseout: function(){
					el.eliminate('mouseover');
					(function(){
						if (!el.retrieve('keep'))
							el.destroy();
						else
							el.eliminate('keep');
					}).delay(10);
				},
				click: function(ev){
					node._clickHandler(e);
				}
			}
		})
		.store('id', e.target.instance.attr('id'));
		
		el.setStyles({
			top: -1000,
			left: -1000	
		});
				
		document.id(document.body).grab(el);
					
		f(e, node, el);
		
		var size = el.getSize();
		var bboxClient = e.target.getBoundingClientRect();
		
		el.setStyles({
			top: (bboxClient.top + bboxClient.bottom)/2 - size.y/2,
			left: (bboxClient.left + bboxClient.right)/2 - size.x/2
		});
	};
	
	/** default mouseout event
	 * By overriding this function the hover 
	 * will stop working event 
	 */
	var mouseout = function(e, node){
		var options = e.target.instance.node;
		(function(){
			var el = document.id('nm-active-hover');
			if (el && el.retrieve('id') !== e.target.instance.attr('id')){
				return;	
			}

			if (el && !el.retrieve('mouseover')){
				el.destroy();
			}
		}).delay(10);
	};
	
	networkMap.Node.registerEvent('mouseover', mouseover);
	networkMap.Node.registerEvent('mouseout', mouseout);
};


/** Default implementaion of events */
networkMap.Node._events = {
	/** default click event */
	click: function(e, node){},
	
	mouseover: function(e, options, hover){},	

	mouseout: function(e, node){},	
	
	/** default hover event */
	hover: function(e, node, el){
		el.set('text', node.options.name);
	}
};

