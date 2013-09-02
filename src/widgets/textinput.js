networkMap.widget = networkMap.widget || {};

networkMap.widget.TextInput = new Class ({
	Implements: [Options, Events],
	options: {
		class: 'nm-input-text',
		type: 'text'
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
			type: this.options.type,
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