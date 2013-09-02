networkMap.widget = networkMap.widget || {};

networkMap.widget.Modal = new Class ({
	Implements: [Options, Events],
	options: {
		class: 'modal',
		title: '',
		content: '',
		footer: '',
		type: 'alert'
	},
	initialize: function(options){
		this.setOptions(options);
		
		this.buildUI();	
	},
	buildUI: function(){
		var modal = this.modal = new Element('div', {class: 'modal hide fade in', styles: {zIndex: 1000000}});
		
		var header = this.header = new Element('div', {class: 'modal-header'});
		var closeButton = this.closeButton = new Element('button', {
			class: 'close', 
			html: '&times;'
		}).addEvent('click', this._close.bind(this)).inject(header);
		var title = this.title = new Element('h3', {html: this.options.title}).inject(header);
		
		var body = this.body = new Element('div', {class: 'modal-body', html: this.options.content});

		var footer = this.footer = new Element('div', {class: 'modal-footer', html: this.options.footer});		
		
		modal.grab(header).grab(body).grab(footer);
		
		return this;
	},
	alert: function(html, options){
		options = options || {};
		
		this.body.set('html', html);
		this.title.set('html', (options.title) ? options.title : 'Alert');		
		
		new Element('a', {
			href: '#', 
			class: 'btn', 
			text: (options.button) ? options.button : 'Ok'
		}).addEvent('click', this.destroy.bind(this)).inject(this.footer);

		document.body.grab(this.modal);		

		return this.show();				
	},
	confirm: function(html, options){
		options = options || {};
		
		this.body.set('html', html);
		this.title.set('html', (options.title) ? options.title : 'Alert');		
		
		new Element('a', {
			href: '#', 
			class: 'btn', 
			text: (options.button) ? options.cancelButton : 'Cancel'
		}).addEvent('click', this._cancel.bind(this)).inject(this.footer);
		
		new Element('a', {
			href: '#', 
			class: 'btn', 
			text: (options.button) ? options.okButton : 'Ok'
		}).addEvent('click', this._ok.bind(this)).inject(this.footer);

		document.body.grab(this.modal);		

		return this.show();				
	},
	show: function(){
		this.modal.setStyle('display', 'block');
		return this;
	},
	destroy: function(){
		this.modal.destroy();
		return this;
	},
	
	_close: function(e){
		this.fireEvent('close', [e]);
		this.destroy();
	},
	_ok: function(e){
		this.fireEvent('ok', [e]);
		this.destroy();
	},
	_cancel: function(e){
		this.fireEvent('cancel', [e]);
		this.destroy();
	}
});