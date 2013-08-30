networkMap.events = networkMap.events || {
	click: function(e, link){
		if (link.options.events.click.href){
			window.location.href = link.options.events.click.href;
		}
	},
	
	hover: function(e, link, el){
		el.set('text', link.options.name);
	},
	mouseover: function(e, options, hover){},
	
	mouseout: function(e, options, hover){}
};

networkMap.registerEvent = function(name, f){
	if (!networkMap.events[name])
		throw "Invalid event: " + name + " is not an registered event";
	
	if (name === 'click'){
		networkMap.events[name] = function(e, link){
			//var options = (e.target.instance.link) ? e.target.instance.link.click : e.target.instance.parent.link.click;
			f(e, link);
		};
	}
	else if (name === 'hover'){	
		networkMap.events.mouseover = function(e, link){
			var el = document.id('nm-active-hover');
			var id = e.target.instance.attr('id');
			
			if (el){
				if (el && el.retrieve('id') !== e.target.instance.attr('id')){
					el.destroy();	
				}
				else{
					el.store('keep', true);
					return;
				}	
			}
			
			
			var position = e.target.getPosition(),
				svg = e.target.instance;
				
				
			var segment11 = svg.getSegment(2),
				segment12 = svg.getSegment(3),
				segment21 = svg.getSegment(5),
				segment22 = svg.getSegment(6);
			
			var midX = ((segment11.coords[0] + segment22.coords[0])/2 +
				(segment12.coords[0] + segment21.coords[0])/2)/2;
	
			var midY = ((segment11.coords[1] + segment22.coords[1])/2 +
				(segment12.coords[1] + segment21.coords[1])/2)/2;
	
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
						// swap targets :)
						//ev.target = e.target;
						//e.target.instance.clickHandler(e);
						link._clickHandler(e);
					}
						
					
				}
			})
			.store('id', e.target.instance.attr('id'));
			
			el.setStyles({
				top: -1000,
				left: -1000	
			});
					
			
			document.id(document.body).grab(el);
						
			f(e, link, el);
			
			var size = el.getSize();
			el.setStyles({
				top: midY - size.y/2 + e.target.instance.doc().parent.getPosition().y,
				left: midX - size.x/2 + e.target.instance.doc().parent.getPosition().x
			});
		};
		
		networkMap.events.mouseout = function(e, link){
			var options = e.target.instance.link;
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
	}
	else{
		networkMap.events[name] = f;	
	}
};

networkMap.registerEvent('click', networkMap.events.click);
networkMap.registerEvent('mouseover', networkMap.events.mouseover);
networkMap.registerEvent('mouseout', networkMap.events.mouseout);
networkMap.registerEvent('hover', networkMap.events.hover);