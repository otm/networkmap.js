/**
 * Creates an instance of networkMap.SettingsManager.
 *
 * @constructor
 * @this {networkMap.SettingsManager}
 * @param {Element} The html element to inject into
 * @param {networkMap.Mediator} An instance of networkMap.Mediator
 */
networkMap.SettingsManager = function(container, mediator){
	this.container = container;
	this.mediator = mediator;
	this.editing = false;
	this.nav = this.createMenu();
	container.appendChild(this.nav);

	if (this.mediator){
		this.mediator.subscribe('edit', this.edit.bind(this));
	}
};

networkMap.extend(networkMap.SettingsManager, networkMap.Observable);

networkMap.extend(networkMap.SettingsManager, {
	
	/**
	 * Create the HTML for the settings manager
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {Element} The HTML for the settingsmanager.
	 */
	createMenu: function(){
		var nav = document.createElement('nav');
		nav.classList.add('nm-menu');

		var trigger = document.createElement('div');
		trigger.classList.add('nm-trigger');
		trigger.innerHTML = '<span class="nm-icon nm-icon-menu"></span><a class="nm-label">Settings</a>';
		trigger.addEventListener('click', this.toggle.bind(this));

		var menu = this.menu = document.createElement('ul');

		var editContent = document.createElement('ul');
		editContent.classList.add('nm-object-properties');
		editContent.setAttribute('id', 'nm-edit-content');

		menu.appendChild(editContent);

		var menuButtons = this.menuButtons = document.createElement('li');
		menuButtons.classList.add('clearfix', 'nm-menu-buttons');

		var saveButton = this.btnSave = document.createElement('button');
		saveButton.textContent = 'Save';
		saveButton.classList.add('btn', 'btn-primary', 'pull-right');
		saveButton.addEventListener('click', this.save.bind(this));

		menu.appendChild(menuButtons);
		menuButtons.appendChild(saveButton);
		nav.appendChild(trigger);
		nav.appendChild(menu);

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
		return this.nav.querySelector('#nm-edit-content');
		//return this.nav.getElement('#nm-edit-content');
	},

	/**
	 * By calling this function and sending in the 
	 * object that shold be edited the settingsManager
	 * will setup the UI. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	edit: function(configWidget){
		this.editing = configWidget;
		var editables;
		var link = {};		
		
			
		var content = this.getContentContainer();
		this.clear();
		this.displayButtons();
		
		// This is for other types of nodes.
		// TODO: Clean up when all is using the mediator
		if (configWidget.toElement)
			content.appendChild(configWidget.toElement());
		else
			content.appendChild(configWidget.getSettingsWidget().toElement());

		// TODO: Remove when all are using the mediator
		this.fireEvent('edit', [configWidget]);
		
		return this;
	},

	/**
	 * Clears the content container.
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	clear: function(){
		var container = this.getContentContainer();
		while (container.firstChild){
			container.removeChild(container.firstChild);
		}

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
		
		this.menuButtons.style.display = 'block';
		
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
		if (this.nav.classList.contains('nm-menu-open')){
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
		this.nav.classList.add('nm-menu-open');	
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
		this.nav.classList.remove('nm-menu-open');
		var content = this.nav.querySelector('#nm-edit-content');
		while (content.firstChild) {
			content.removeChild(content.firstChild);
		}
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
