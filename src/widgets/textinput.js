networkMap.widget = networkMap.widget || {};

networkMap.widget.TextInput = function(label, value, options){
	this.options = {
		class: 'nm-input-text',
		type: 'text'
	};
	this.setOptions(options);

	this.$destroy = [];

	this.createElements(label, value);
};

networkMap.extend(networkMap.widget.TextInput, networkMap.Observable);
networkMap.extend(networkMap.widget.TextInput, networkMap.Options);
networkMap.extend(networkMap.widget.TextInput, {	
	createElements: function(label, value){
		var wrapper = this.wrapper = document.createElement('div');
		wrapper.classList.add(this.options.class);

		var lbl = this.label = document.createElement('span');
		lbl.textContent = label;

		var input = this.input = document.createElement('input');
		var inputHandler = function(e){
			this.fireEvent('change', [e, this]);
		}.bind(this);
		input.setAttribute('type', this.options.type);
		input.setAttribute('value', (value) ? value : '');
		this.$destroy.push({
			el: input,
			type: 'change',
			fn: inputHandler
		});
		input.addEventListener('change', inputHandler, false);

		if (this.options.disabled === true){
			this.input.disabled = true;
		}
		
		wrapper.appendChild(lbl);
		wrapper.appendChild(input);

		return this;
	},
	
	value: function(){
		return (this.input.value !== '') ? this.input.value : undefined;
	},

	toElement: function(){
		return this.wrapper;
	}
});