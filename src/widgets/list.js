networkMap.widget = networkMap.widget || {};

networkMap.widget.List = new Class ({
	Implements: [Options, Events],
	options: {
		class: 'nm-list'
	},
	list: null,
	listItems: [],
	initialize: function(options){
		this.setOptions(options);
		this.list = new Element('ul', {
			class: this.options.class
		});
	},
	toElement: function(){
		return this.list;
	},
	add: function(element, options){
		var listItem = new networkMap.widget.ListItem(element, options);
		listItem.addEvent('remove', this.remove.bind(this));
		this.listItems.push(listItem);
		this.list.grab(listItem);
		
		return listItem;
	},
	remove: function(listItem){
		this.listItems = this.listItems.erase(listItem);
		
		return this;
	}
});

networkMap.widget.ListItem = new Class ({
	Implements: [Options, Events],
	options: {
		class: 'nm-list-item',
		enableDelete: false
	},
	initialize: function(element, options){
		this.setOptions(options);
		this.listItem = new Element('li', {
			class: this.options.class
		});
		
		if (typeof element == 'string'){
			this.listItem.set('text', element);	
		}
		else {
			this.listItem.grab(element);	
		}
		if (this.options.enableDelete){
			this.listItem.grab(new Element('span', {
				text: 'x',
				class: 'nm-list-item-delete pull-right',
				events: {
					click: this.remove.bind(this)
				}
			}));	
		}
	},
	remove: function(){
		this.listItem.destroy();
		delete this.listItem;
		this.fireEvent('remove', [this]);
		
		return this;
	},
	toElement: function(){
		return this.listItem;
	}
});

