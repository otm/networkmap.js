networkMap.widget = networkMap.widget || {};

networkMap.widget.ColorInput = new Class ({
	Implements: [Options, Events],
	options: {
		class: 'nm-input-color'
	},
	wrapper: null,
	label: null,
	input: null,
	initialize: function(label, value, options){
		this.setOptions(options);
		this.wrapper = new Element('div', {
			class: this.options.class
		});
		this.label = new Element('span', {
			text: label
		});

		this.div = new Element('div');		
		
		this.input = new Element('input', {
			type: 'color',
			value: value
		}).addEvent('change', function(e){
			this.fireEvent('change', [e]);
		}.bind(this)); 
		
		if (this.options.disabled === true){
			this.input.disabled = true;
		}
		
		this.wrapper.grab(this.label).grab(this.div.grab(this.input));
	},
	toElement: function(){
		return this.wrapper;
	}
});