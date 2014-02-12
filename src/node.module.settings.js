networkMap.Node.Module = networkMap.Node.Module || {};

networkMap.Node.Module.Settings = function(properties){
	this.properties = properties;
};

// types: angle, bool, float, int, number, length, list, string, color
// https://api.tinkercad.com/libraries/1vxKXGNaLtr/0/docs/topic/Shape+Generator+Overview.html
networkMap.extend(networkMap.Node.Module.Settings, {

	/** Definitions of the parameters */
	parameters: {
		id: {
			label: 'ID',
			type: 'text',
			disabled: true,
			global: false
		},
		name: {
			label: 'Name',
			type: 'text',
			global: false
		},
		comment: {
			label: 'Comment',
			type: 'text',
			global: false
		},
		padding: {
			label: 'Padding',
			type: 'number',
			min: 0,
			global: true
		},
		fontSize: {
			label: 'Font size',
			type: 'number',
			min: 1,
			global: true
		},
		bgColor: {
			label: 'Color',
			type: 'color',
			global: true
		},
		strokeColor: {
			label: 'Stroke color',
			type: 'color',
			global: true
		},
		strokeWidth: {
			label: 'Stroke width',
			type: 'number',
			min: 0,
			global: true
		}
		
	},

	/**
	 * Generates HTML that is used for configuration
	 *
	 * @this {networkMap.Node}
	 * @return {Element} A HTML Element that contains the UI
	 */
	toElement: function(properties){
		var container = new networkMap.widget.Accordion();
		var accordionGroup;

		var changeHandler = function(key, properties){
			return function(e, widget){
				properties.set(key, widget.value());	
			};
		};
	
		accordionGroup = container.add('Globals');		
		networkMap.each(this.parameters, function(option, key){
			if (option.type === 'number'){
				accordionGroup.appendChild(new networkMap.widget.IntegerInput(option.label, properties.get(key), option).addEvent('change', changeHandler(key, properties)));
			}
			else if(option.type === 'text'){
				accordionGroup.appendChild(new networkMap.widget.TextInput(option.label, properties.get(key), option).addEvent('change', changeHandler(key, properties)));
			}
			else if (option.type === 'color'){
				accordionGroup.appendChild(new networkMap.widget.ColorInput(option.label, properties.get(key), option).addEvent('change', changeHandler(key, properties)));	
			}
		}.bind(this));
		
		return container;
	}
});