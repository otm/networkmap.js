networkMap.widget = networkMap.widget || {};

networkMap.widget.GridInput = new Class ({
	Implements: [Options, Events],
	options: {
		class: 'nm-input-snap',
		type: 'snap'
	},
	wrapper: null,
	label: null,
	check: null,
	
	initialize: function(label, value, options){
		this.setOptions(options);
		this.wrapper = new Element('div', {
			class: this.options.class
		});
		this.label = new Element('span', {
			text: label
		});
		this.check = new Element('input', {
			type: 'checkbox',
			checked: value.enabled
		}).addEvent('change', function(e){
			this.xinput.disabled = !this.check.checked;
			this.yinput.disabled = !this.check.checked;
			e.value = this.value();
			this.fireEvent('change', [e]);
		}.bind(this)); 

		this.xlabel = new Element('span', {
			text: 'x'
		});
		this.xinput = new Element('input', {
			type: 'number',
			value: (value.grid.x) ? value.grid.x : 1,
			min: 1,
			max: 50
		}).addEvent('change', function(e){
			e.value = this.value();
			this.fireEvent('change', [e]);
		}.bind(this));

		this.ylabel = new Element('span', {
			text: 'y'
		});
		this.yinput = new Element('input', {
			type: 'number',
			value: (value.grid.y) ? value.grid.y : 1,
			min: 1,
			max: 50
		}).addEvent('change', function(e){
			e.value = this.value();
			this.fireEvent('change', [e]);
		}.bind(this));
	
		if (!value.enabled){
			this.xinput.disabled = true;
			this.yinput.disabled = true;
		}
		
		this.wrapper
		.grab(this.label)
		.grab(this.check)
		.grab(this.xlabel)
		.grab(this.xinput)
		.grab(this.ylabel)
		.grab(this.yinput);
	},
	value: function(){
		return {
			enabled: this.check.checked,
			grid: {
				x: this.xinput.value,
				y: this.yinput.value
			}
		};
	},
	toElement: function(){
		return this.wrapper;
	}
});