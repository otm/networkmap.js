networkMap.widget = networkMap.widget || {};

networkMap.widget.IntegerInput = new Class ({
	Implements: [Options, Events],
	options: {
		class: 'nm-input-integer'
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
		this.input = new Element('input', {
			type: 'number',
			value: value
		}).addEvent('change', function(e){
			this.fireEvent('change', [e]);
		}.bind(this)); 
		
		if (this.options.disabled === true){
			this.input.disabled = true;
		}
		
		this.wrapper.grab(this.label).grab(this.input);
	},
	toElement: function(){
		return this.wrapper;
	}
});