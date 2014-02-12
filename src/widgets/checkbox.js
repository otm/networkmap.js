networkMap.widget = networkMap.widget || {};

networkMap.widget.Checkbox = function(label, value, options){
	this.options = {
		class: 'nm-checkbox',
		type: 'checkbox'
	};

	this.setOptions(options);
	this.createElements(label, value);
};

networkMap.extend(networkMap.widget.Checkbox, networkMap.Observable);
networkMap.extend(networkMap.widget.Checkbox, networkMap.Options);
networkMap.extend(networkMap.widget.Checkbox, {

	createElements: function(label, value){
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add(this.options.class);

		this.label = document.createElement('span');
		this.label.textContent = label;

		this.input = document.createElement('input');
		this.input.setAttribute('type', this.options.type);
		this.input.checked = value;
		this.input.addEventListener('change', function(e){
			this.fireEvent('change', [e, this]);
		}.bind(this));


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
		return this.input.value;
	},
	
	isChecked: function(){
		return this.input.checked;
	}
});