networkMap.widget = networkMap.widget || {};

networkMap.widget.List = function(options){
	this.options = {
		class: 'nm-list'
	};
	this.listItems = [];
	this.setOptions(options);

	this.list = document.createElement('ul');
	this.list.classList.add(this.options.class);
};

networkMap.extend(networkMap.widget.List, networkMap.Observable);
networkMap.extend(networkMap.widget.List, networkMap.Options);
networkMap.extend(networkMap.widget.List, {
	toElement: function(){
		return this.list;
	},
	add: function(element, options){
		var listItem = new networkMap.widget.ListItem(element, options);
		listItem.addEvent('remove', this.remove.bind(this));
		this.listItems.push(listItem);
		this.list.appendChild(listItem.toElement());
		
		return listItem;
	},
	remove: function(listItem){
		var index = this.listItems.indexOf(listItem);
		this.listItems.splice(index, 1);
				
		return this;
	}
});

networkMap.widget.ListItem = function(element, options){
	this.options = {
		class: 'nm-list-item',
		enableDelete: false
	};
	this.setOptions(options);

	this.listItem = document.createElement('li');
	this.listItem.classList.add(this.options.class);

	if (typeof element === 'string'){
		this.listItem.textContent = element;
	}
	else{
		this.listItem.appechChild(element);
	}

	if (this.options.enableDelete){
		var del = document.createElement('span');
		del.textContent = 'x';
		del.classList.add('nm-list-item-delet', 'pull-right');
		this.$remove = this.remove.bind(this);
		del.addEventListener('click', this.$remove);
	}
};

networkMap.extend(networkMap.widget.ListItem, networkMap.Observable);
networkMap.extend(networkMap.widget.ListItem, networkMap.Options);
networkMap.extend(networkMap.widget.ListItem, {
	remove: function(){
		this.listItem.parentNode.removeChild(this.listItem);
		this.listItem.removeEventListener('click', this.$remove);
		delete this.listItem;
		this.fireEvent('remove', [this]);
		
		return this;
	},
	toElement: function(){
		return this.listItem;
	}
});

