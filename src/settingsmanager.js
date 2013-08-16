networkMap.SettingsManager = new Class ({
	Implements: [Options, Events],
	
	options: {
		//onActive
		//onDeactive
		//onSave
	},
	
	container: null,
	editing: false,
	initialize: function(container){
		this.container = container;
		this.nav = this.createMenu();
		container.grab(this.nav);
	},
	
	createMenu: function(){
		var nav = new Element('nav', {
			'class': 'nm-menu'
		});
		
		var trigger = new Element('div', {
			'class': 'nm-trigger',
			html: '<span class="nm-icon nm-icon-menu"></span><a class="nm-label">Settings</a>',
			events: {
				click: this.toggle.bind(this)
			}
		});
		
		var menu = this.menu = new Element('ul');
		
		menu.grab(new Element('ul', {
			'class': 'nm-object-properties',
			id: 'nm-edit-content'	
		}));
		
		var menuButtons = this.menuButtons = new Element('li', {
			class: 'clearfix nm-menu-buttons', 
		});

		var saveButton = new Element('button', {
			text: 'Save',
			class: 'btn btn-primary pull-right',
			events: {
				click: this.save.bind(this)
			}
		});
		
		menu.grab(menuButtons.grab(saveButton));

		nav.grab(trigger);
		nav.grab(menu);
		
		return nav;
	},
	getContentContainer: function(){
		return this.nav.getElement('#nm-edit-content');
	},
	edit: function(obj){
		this.editing = obj;
		var editables;
		var link = {};		
		
			
		var content = this.nav.getElement('#nm-edit-content');
		content.empty();
	
		// Check if the object is a link
		if (obj.getLink){
			link = obj.getLink();
			content.grab(link.getSettingsWidget());
			return this;			
		}
	
		// This is for other types of nodes.
		content.grab(obj.getSettingsWidget());		
		
	
		
		return this;
	},
	
	toggle: function(){
		if (this.nav.hasClass('nm-menu-open')){
			this.disable();
		}
		else {
			this.enable();
		}
	},
	
	enable: function(){
		this.nav.addClass('nm-menu-open');	
		this.fireEvent('active');
	},
	
	disable: function(){
		this.nav.removeClass('nm-menu-open');
		this.nav.getElement('#nm-edit-content').empty();
		this.fireEvent('deactive');
	},
	
	save: function(){
		this.fireEvent('save');
	}

});
