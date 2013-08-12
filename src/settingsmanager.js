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
		
		var menu = new Element('ul');
		
		menu.grab(new Element('ul', {
			'class': 'nm-object-properties',
			id: 'nm-edit-content'	
		}));
		
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
	edit: function(obj){
		this.editing = obj;
		var editables;
		var link = {};		
		
			
		var content = this.nav.getElement('#nm-edit-content');
		content.empty();
	
		var changeHandler = function(key, obj){
			return function(e){
				obj.setProperty(key, this.value);	
			};
		};
	
		if (obj.getLink){
			link = obj.getLink();
			editables = link.getEditables();
			Object.each(editables, function(property, key){
				content.grab(new Element('li', {
					text: property.label	
				}));
	
				var input = new Element('input', {
					type: 'text',
					value: link.getProperty(key),
					events: {
						change: changeHandler(key, link)
					}
				});
				
				if (property.disabled === true){
					input.disabled = true;
				}
				
				content.grab(new Element('li').grab(input));
			});
		}
	
		editables = obj.getEditables();
		Object.each(editables, function(property, key){
			
			content.grab(new Element('li', {
				text: property.label	
			}));

			var input = new Element('input', {
				type: 'text',
				value: obj.getProperty(key),
				events: {
					change: changeHandler(key, obj)
				}
			});
			
			if (property.disabled === true){
				input.disabled = true;
			}
			
			content.grab(new Element('li').grab(input));
		});		
		
	
		
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
