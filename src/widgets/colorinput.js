networkMap.widget = networkMap.widget || {};

networkMap.widget.ColorInput = function(label, value, options){
	this.options = {
		class: 'nm-input-color'
	};

	this.setOptions(options);

	this.createElements(label, value);
};

networkMap.extend(networkMap.widget.ColorInput, networkMap.Observable);
networkMap.extend(networkMap.widget.ColorInput, networkMap.Options);
networkMap.extend(networkMap.widget.ColorInput, {

	createElements: function(label, value){
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add(this.options.class);

		this.label = document.createElement('span');
		this.label.textContent = label;

		this.div = document.createElement('div');

		this.input = document.createElement('input');
		this.input.setAttribute('type', 'color');
		this.input.setAttribute('value', value);
		this.input.addEventListener('change', function(e){
			this.fireEvent('change', [e, this]);
		}.bind(this));
		
		if (this.options.disabled === true){
			this.input.disabled = true;
		}

		this.div.appendChild(this.input);
		this.wrapper.appendChild(this.label);
		this.wrapper.appendChild(this.div);
	},

	/**
	 * Get the current value of the widget
	 * @return {string} The color encoded as a string
	 */
	value: function(){
		return this.input.value;
	},

	toElement: function(){
		return this.wrapper;
	}
});