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

		/*
		// TODO: Clean up code		
		var tmpValue = (value.inherited) ? value.value : 
			(value) ? value : null;
			
		if (!tmpValue && value.inherited)
			this.increment = parseInt(value.inherited, 10);
		else
			this.increment = 0;
		*/
		this.input.value = (value.inherited && value.value) ? value.value : 
			(value.inherited) ? '' :
			(value) ? value : '';
			
			
		if (value.inherited) this.input.setAttribute('placeholder', value.inherited);
		this.input.addEventListener('change', function(e){
			/*
			if (this.input.value === '' && value.inherited){
				this.increment = parseInt(value.inherited, 10);
			}
			if (this.increment && (this.options.min !== undefined && parseInt(this.input.value, 10) === this.options.min ) || parseInt(this.input.value, 10) === 1) ){
				this.input.value = parseInt(this.input.value) + parseInt(this.increment);
				this.increment = 0;
			}
			if (this.increment && (parseInt(this.input.value, 10) === this.options.min || parseInt(this.input.value, 10) === 0)){
				this.input.value = parseInt(this.increment) - 1;
				this.increment = 0;
			}
			*/
			e.value = this.value();
			
			// this is a hack to prevent the change event to 
			// fire twice in chrome
			var self = this;
			setTimeout(function(){
				self.fireEvent('change', [e, self]);
			}, 1);
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