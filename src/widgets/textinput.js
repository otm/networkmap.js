networkMap.widget = networkMap.widget || {};

networkMap.widget.TextInput = new Class ({
	Implements: [Options, Events],
	options: {
		class: 'nm-input-text'
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
			type: 'text',
			value: value
		}); 
	
		if (this.options.disabled === true){
			this.input.disabled = true;
		}
		
		this.wrapper.grab(this.label).grab(this.input);
	},
	toElement: function(){
		return this.wrapper;
	}
});