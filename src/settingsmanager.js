networkMap.SettingsManager = new Class ({
	Implements: [Options, Events],
	options: {
		//onActive
		//onDeactive
		//onSave
	},
	container: null,
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
		
		var menu = new Element('ul');
		menu.grab(new Element('li', {
			html: '<button class="btn btn-primary pull-right">Save</button>',
			'class': 'clearfix', 
			events: {
				click: this.save.bind(this)
			}
		}));

		nav.grab(trigger);
		nav.grab(menu);
		
		return nav;
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
		this.fireEvent('deactive');
	},
	save: function(){
		this.fireEvent('save');
	}

});
