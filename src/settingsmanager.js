networkMap.SettingsManager = new Class ({
	Implements: [Options, Events],
	
	options: {
		//onActive
		//onDeactive
		//onSave
	},
	
	container: null,
	editing: false,

	/**
	 * Creates an instance of networkMap.SettingsManager.
	 *
	 * @constructor
	 * @this {networkMap.SettingsManager}
	 * @param {Element} The html element to inject into
	 * @param {Object} A options object.
	 */
	initialize: function(container, options){
		this.setOptions(options);
		this.container = container;
		this.nav = this.createMenu();
		container.grab(this.nav);
	},
	
	/**
	 * Create the HTML for the settings manager
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {Element} The HTML for the settingsmanager.
	 */
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

		var saveButton = this.btnSave = new Element('button', {
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

	/**
	 * Returns the content container. This container is
	 * used when custom html should be injected.
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {Element} The content conainer
	 */
	getContentContainer: function(){
		return this.nav.getElement('#nm-edit-content');
	},

	/**
	 * By calling this function and sending in the 
	 * object that shold be edited the settingsManager
	 * will setup the UI. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	edit: function(obj){
		this.editing = obj;
		var editables;
		var link = {};		
		
			
		var content = this.getContentContainer();
		this.clear();
		this.displayButtons();
		
		// This is for other types of nodes.
		content.grab(obj.getSettingsWidget());		
		
		this.fireEvent('edit', [obj]);
		
		return this;
	},

	/**
	 * Clears the content container.
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	clear: function(){
		this.getContentContainer().empty();

		return this;
	},
	
	/**
	 * Hides the normal menu buttons. The callback
	 * will be called before they are set into visable
	 * state. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	hideButtons: function(callback){
		
		this.menuButtons.setStyle('display', 'none');
		this.showButtonsCallback = (callback) ? callback : function(){};
		
		return this;	
	},

	/**
	 * Hides the normal menu buttons. The callback
	 * will be called before they are set into visable
	 * state. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	displayButtons: function(){
		if (!this.showButtonsCallback){
			return this;
		}
			
		this.showButtonsCallback();
		delete this.showButtonsCallback;
		
		this.menuButtons.setStyle('display', 'block');
		
		return this;
	},

	defaultView: function(){
		this.clear();
		this.fireEvent('defaultView', [this]);	
	},

	/**
	 * Toggle the settings manager. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	toggle: function(){
		if (this.nav.hasClass('nm-menu-open')){
			return this.disable();
		}
		else {
			return this.enable();
		}
	},
	

	/**
	 * Enable the settings manager. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	enable: function(){
		this.nav.addClass('nm-menu-open');	
		this.fireEvent('active');
		this.fireEvent('defaultView', [this]);

		return this;
	},
	

	/**
	 * Disable the settings manager. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	disable: function(){
		this.nav.removeClass('nm-menu-open');
		this.nav.getElement('#nm-edit-content').empty();
		this.fireEvent('deactive');

		return this;
	},
	

	/**
	 * This triggers a save event.
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	save: function(){
		this.fireEvent('save');

		return this;
	}

});
