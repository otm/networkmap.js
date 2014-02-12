networkMap.Link.Module = networkMap.Link.Module || {};

networkMap.Link.Module.Settings = function(properties){
	this.properties = properties;
};

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
		var container = new networkMap.widget.Accordion();
		var accordionGroup;

		var changeHandler = function(key, obj){
			return function(e, widget){
				obj.set(key, widget.value());	
			};
		};
	
		accordionGroup = container.add('Globals');		
		networkMap.each(this.parameters, function(option, key){
			accordionGroup.appendChild(new networkMap.widget.IntegerInput(option.label, properties.get(key, true), option)
				.addEvent('change', changeHandler(key, properties))
			);
		}.bind(this));		
		
		
		
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
			}, 
			width: {
				label: 'Width',
				type: 'number',
				min: 0,
				global: false
			}
		};		

		
		var sublinkConf = function(label, node){
			accordionGroup = container.add(label);
			networkMap.each(linkTemplate, function(option, key){
				if (['id'].some(function(item){ return item == key;})){
					accordionGroup.appendChild(new networkMap.widget.TextInput(option.label, properties.get(node + '.' + key), option).addEvent('change', changeHandler(key, link.properties)));
				}
				else{
					if (option.type === 'number'){
						accordionGroup.appendChild(
							new networkMap.widget.IntegerInput(
								option.label, 
								link.path.nodeA.properties.get(key, true), 
								option
							)
							.addEvent('change', changeHandler(key, link.path[node].properties))
						);
					}
					else if(option.type === 'text'){
						accordionGroup.appendChild(
							new networkMap.widget.TextInput(
								option.label, 
								link.path.nodeA.properties.get(key), 
								option
							)
							.addEvent('change', changeHandler(key, link.path[node].properties))
						);
					}
					else if(option.type === 'color'){
						accordionGroup.appendChild(
							new networkMap.widget.ColorInput(
								option.label, 
								link.path.nodeA.properties.get(key), 
								option
							)
							.addEvent('change', changeHandler(key, link.path[node].properties))
						);
					}
				}
			}.bind(this));
		}.bind(this);
		
		sublinkConf('Node A', 'nodeA');
		sublinkConf('Node B', 'nodeB');
		

		
		// Add sublinks
		var sublinkList;
		if (link.subpath.nodeA && link.subpath.nodeB && link.subpath.nodeA.length === link.subpath.nodeB.length) {
			accordionGroup = container.add('Sublinks');
			sublinkList = new networkMap.widget.List();
			link.subpath.nodeA.forEach(function(subpath, index){
				sublinkList.add(subpath.properties.get('name') + ' - ' + link.subpath.nodeB[index].properties.get('name'), {enableDelete: false});
			});
			accordionGroup.appendChild(sublinkList);
		}
		else{ // Asymetric link
			if (link.subpath.nodeA || link.subpath.nodeB){
				accordionGroup = container.add('Sublinks');
				sublinkList = new networkMap.widget.List();
			}

			if (link.subpath.nodeA){
				link.subpath.nodeA.forEach(function(subpath, index){
					sublinkList.add(subpath.properties.get('name') + ' - ' + 'N/A', {enableDelete: false});
				});
			}

			if (link.subpath.nodeB){
				link.subpath.nodeB.forEach(function(subpath, index){
					sublinkList.add('N/A' + ' - ' + subpath.properties.get('name'), {enableDelete: false});
				});
			}

			if (link.subpath.nodeA || link.subpath.nodeB){
				accordionGroup.appendChild(sublinkList);
			}
		}
		
		return container;
	}
});