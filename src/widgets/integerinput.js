networkMap.widget = networkMap.widget || {};

networkMap.widget.IntegerInput = function(label, value, options){
	this.options = {
		class: 'nm-input-integer'
	};
	this.setOptions(options);
	this.createElements(label, value);	
};


networkMap.extend(networkMap.widget.IntegerInput, networkMap.Observable);
networkMap.extend(networkMap.widget.IntegerInput, networkMap.Options);
networkMap.extend(networkMap.widget.IntegerInput, {
	createElements: function(label, value){
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add(this.options.class);

		this.label = document.createElement('span');
		this.label.textContent = label;

		this.input = document.createElement('input');
		this.input.setAttribute('type', 'number');

		// TODO: Clean up code		
		var tmpValue = (value.inherited) ? value.value : value;
		if (!tmpValue && value.inherited)
			this.increment = value.inherited;
		else
			this.increment = 0;
		
		this.input.value = (value.inherited) ? value.value: value;
		if (value.inherited) this.input.setAttribute('placeholder', value.inherited);
		this.input.addEventListener('change', function(e){
			if (this.increment){
				this.input.value = parseInt(this.input.value) + parseInt(this.increment);
				this.increment = 0;
			}
			this.fireEvent('change', [e, this]);
		}.bind(this));

		if (this.options.min !== undefined){
			this.input.setAttribute('min', this.options.min);	
		}

		if (this.options.disabled === true){
			this.input.disabled = true;
		}

		this.wrapper.appendChild(this.label);
		this.wrapper.appendChild(this.input);

		return this;
	},

	toElement: function(){
		return this.wrapper;
	},

	value: function(){
		return (this.input.value !== '') ? parseInt(this.input.value) : undefined;
	}
});