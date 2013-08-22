networkMap.widget = networkMap.widget || {};

networkMap.widget.Select = new Class ({
	Implements: [Options, Events],
	options: {
		class: 'nm-input-select'
	},
	wrapper: null,
	label: null,
	input: null,
	initialize: function(label, values, options){
		this.setOptions(options);
		this.wrapper = new Element('div', {
			class: this.options.class
		});
		this.label = new Element('span', {
			text: label
		});
		
		this.input = new Element('select')
		.addEvent('change', function(e){
			this.fireEvent('select', [e, this]);
		}.bind(this)); 
	
		if (this.options.disabled === true){
			this.input.disabled = true;
		}
		
		this.addOptions(values);
		this.wrapper.grab(this.label).grab(this.input);
	},
	addOptions: function(values){
		values.each(function(value){
			this.addOption(value);
		}.bind(this));
	},
	addOption: function(value, selected){
		this.input.grab(new Element('option', {
			value: value,
			text: value,
			selected: selected
		}));
		return this;
	},
	getSelected: function(){
		return this.input.getSelected()[0].value;
	},
	clearOptions: function(){
		this.input.empty();
		return this;
	},
	toElement: function(){
		return this.wrapper;
	},
	toString: function(){
		return this.getSelected();	
	}
});