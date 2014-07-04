networkMap.Link.Module = networkMap.Link.Module || {};

networkMap.Link.Module.Settings = function(properties, options){
	this.options = {
		onlyGlobals: false,
		header: 'Globals',
		container: null
	};
	this.setOptions(options);

	this.properties = properties;
};


networkMap.extend(networkMap.Link.Module.Settings, networkMap.Options);

// types: angle, bool, float, int, number, length, list, string, color
// https://api.tinkercad.com/libraries/1vxKXGNaLtr/0/docs/topic/Shape+Generator+Overview.html
networkMap.extend(networkMap.Link.Module.Settings, {

	/** Definitions of the parameters */
	parameters: {
		width: {
			label: 'Width',
			type: 'number',
			min: 0,
			global: true
		},
		inset: {
			label: 'Inset',
			type: 'number',
			min: 1,
			global: true
		},
		connectionDistance: {
			label: 'Chamfer',
			type: 'number',
			min: 0,
			global: true
		},
		staticConnectionDistance: {
			label: 'Offset',
			type: 'number',
			min: 1,
			global: true
		},
		arrowHeadLength: {
			label: 'Arrow Head',
			type: 'number',
			min: 0,
			global: true
		}
	},

	/**
	 * Generates HTML that is used for configuration
	 * @param  {networkMap.Link} link       The link object
	 * @param  {networkMap.Properties} properties The properties of the link object
	 * @return {HTMLElement}            A HTMLElement containing the widget
	 */	
	toElement: function(link, properties){
		properties = properties || this.properties;
		var container = this.options.container || new networkMap.widget.Accordion();
		var accordionGroup;

		var changeHandler = function(key, obj){
			return function(e, widget){
				obj.set(key, widget.value());	
			};
		};
	
		accordionGroup = container.add(this.options.header);		
		networkMap.each(this.parameters, function(option, key){
			accordionGroup.appendChild(new networkMap.widget.IntegerInput(option.label, properties.get(key, true), option)
				.addEvent('change', changeHandler(key, properties))
			);
		}.bind(this));		
		
		// This is added to prevent non global configuration to be added
		if (this.options.onlyGlobals){
			return container;
		}
		
		var linkTemplate = {
			id: {
				label: 'Node',
				type: 'text',
				disabled: true,
				global: false
			},
			name: {
				label: 'Interface',
				type: 'text',
				disabled: true,
				global: false
			}
			/* TODO: Descide if this is needed
			, 
			width: {
				label: 'Width',
				type: 'number',
				min: 0,
				global: false
			}
			*/
		};		
		
		var sublinkConf = function(label, node){
			accordionGroup = container.add(label);
			networkMap.each(linkTemplate, function(option, key){
				if (['id'].some(function(item){ return item == key;})){
					accordionGroup.appendChild(new networkMap.widget.TextInput(option.label, properties.get(node + '.' + key), option)
						.addEvent('change', changeHandler(key, link.properties))
					);
				}
				else{
					if (option.type === 'number'){
						accordionGroup.appendChild(
							new networkMap.widget.IntegerInput(
								option.label, 
								link.subLinks[node].primaryLink.properties.get(key, true), 
								option
							)
							.addEvent('change', changeHandler(key, link.subLinks[node].primaryLink.properties))
						);
					}
					else if(option.type === 'text'){
						accordionGroup.appendChild(
							new networkMap.widget.TextInput(
								option.label, 
								link.subLinks[node].primaryLink.properties.get(key), 
								option
							)
							.addEvent('change', changeHandler(key, link.subLinks[node].primaryLink.properties))
						);
					}
					else if(option.type === 'color'){
						accordionGroup.appendChild(
							new networkMap.widget.ColorInput(
								option.label, 
								link.subLinks[node].primaryLink.properties.get(key), 
								option
							)
							.addEvent('change', changeHandler(key, link.subLinks[node].primaryLink.properties))
						);
					}
				}
			}.bind(this));
		}.bind(this);
		
		sublinkConf('Node A', 'nodeA');
		sublinkConf('Node B', 'nodeB');
		

		
		// Add sublinks
		var sublinkList;
		if (link.subLinks.nodeA && link.subLinks.nodeB && link.subLinks.nodeA.memberLinks.length === link.subLinks.nodeB.memberLinks.length) {
			accordionGroup = container.add('Sublinks');
			sublinkList = new networkMap.widget.List();
			link.subLinks.nodeA.memberLinks.forEach(function(subpath, index){
				sublinkList.add(subpath.properties.get('name') + ' - ' + link.subLinks.nodeB.memberLinks[index].properties.get('name'), {enableDelete: false});
			});
			accordionGroup.appendChild(sublinkList);
		}
		else{ // Asymetric link
			if (link.subLinks.nodeA || link.subLinks.nodeB){
				accordionGroup = container.add('Sublinks');
				sublinkList = new networkMap.widget.List();
			}

			if (link.subLinks.nodeA){
				link.subLinks.nodeA.memberLinks.forEach(function(sublink, index){
					sublinkList.add(sublink.properties.get('name') + ' - ' + 'N/A', {enableDelete: false});
				});
			}

			if (link.subLinks.nodeB){
				link.subLinks.nodeB.memberLinks.forEach(function(sublink, index){
					sublinkList.add('N/A' + ' - ' + sublink.properties.get('name'), {enableDelete: false});
				});
			}

			if (link.subLinks.nodeA || link.subLinks.nodeB){
				accordionGroup.appendChild(sublinkList);
			}
		}
		
		return container;
	}
});