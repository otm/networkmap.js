networkMap.widget = networkMap.widget || {};

networkMap.widget.Accordion = new Class ({
	Implements: [Options, Events],
	options: {
		class: 'nm-accordion'
	},
	wrapper: null,
	items: [],
	initialize: function(options){
		this.setOptions(options);
		this.wrapper = new Element('div', {
			class: this.options.class
		});
	},
	toElement: function(){
		return this.wrapper;
	},
	add: function(label){
		var item = new Element ('div', {
			class: 'nm-accordion-group nm-accordion-open'	
		});
		
		var trigger = new Element('div', {
			class: 'nm-accordion-trigger',
			text: label
		});
		
		var list = new Element('ul', {
			class: 'nm-accordion-inner'	
		});
		
		item.grab(trigger);
		item.grab(list);
		this.items.push(item);
		this.wrapper.grab(item);	
		
		trigger.addEvent('click', this.clickHandler.bind(this));	

		return list;
	},
	clickHandler: function(e){
		e.target.getParent().toggleClass('nm-accordion-open');
	}
});