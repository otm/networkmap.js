/**
 * Creates an instance of networkMap.SettingsManager.
 *
 * @constructor
 * @this {networkMap.SettingsManager}
 * @param {Element} The html element to inject into
 * @param {networkMap.Mediator} An instance of networkMap.Mediator
 */
networkMap.SettingsManager = function(container, mediator, defaultView){
	this.container = container;
	this.mediator = mediator;
	this.defaultView = defaultView;

	// An array which contains the views
	this.editing = [];

	this.nav = this.createMenu();
	container.appendChild(this.nav);
	
	
	this._actions = {};

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

		var editContent = this.contentContainer = document.createElement('li');
		editContent.classList.add('nm-object-properties');
		editContent.setAttribute('id', 'nm-edit-content');

		menu.appendChild(editContent);

		var menuButtons = this.menuButtons = document.createElement('li');
		menuButtons.classList.add('clearfix', 'nm-menu-buttons');

		var saveButton = this.btnSave = document.createElement('button');
		saveButton.textContent = 'Save';
		saveButton.classList.add('btn', 'btn-primary', 'pull-right');
		saveButton.addEventListener('click', this.save.bind(this));

		var addButton = this.btnAdd = document.createElement('button');
		addButton.textContent = 'Add';
		addButton.classList.add('btn', 'btn-success');
		addButton.addEventListener('click', this.add.bind(this));
		
		var deleteButton = this.btnDelete = document.createElement('button');
		deleteButton.textContent = 'Delete';
		deleteButton.classList.add('btn', 'btn-danger');
		deleteButton.addEventListener('click', this.delete.bind(this));

		menu.appendChild(menuButtons);
		menuButtons.appendChild(saveButton);
		menuButtons.appendChild(addButton);
		menuButtons.appendChild(deleteButton);
		nav.appendChild(trigger);
		nav.appendChild(menu);

		return nav;
	},

	/**
	 * Returns the content container. This container is
	 * used when custom html should be injected.
	 *
	 * @this {networkMap.SettingsManager}s
	 * @return {Element} The content conainer
	 */
	getContentContainer: function(){
		return this.contentContainer;
		
		// TODO: Remove
		//return this.nav.querySelector('#nm-edit-content');
	},

	/**
	 * By calling this function and sending in the 
	 * object that shold be edited the settingsManager
	 * will setup the UI. This is the default action when 
	 * clicking a node.
	 *
	 * @param {networkMap.event.Configuration} The edit event
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	edit: function(e){
		if (!e.editable)
			return;
		
		this.purgeEditing();
		return this.configure(e);
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
	
	purgeEditing: function(){
		var editing = this.editing;
		
		// make sure they get GCed
		editing.forEach(function(view){
			view.configurationEvent().cancel();
			view.purge();
		});
		
		// drop/truncate references
		editing.length = 0;
	},
	
	previousEdit: function(){
		// prepare the previous view for GC
		var oldView = this.editing.pop();
		if (oldView){
			oldView.purge();
		}

		// fetch the new view
		var newView = this.editing.pop();
		
		// If there are no views display default view
		if (!newView){
			return this.displayDefaultView();
		}

		// Clear the content pane and draw the new view
		// and add it back to the view queue 
		this.clear();
		this.displayButtons();
		this.getContentContainer().appendChild(newView.render());
		this.editing.push(newView);
		
		return this;

	},
	
	setConfigWidget: function(configWidget){
		this.defaultView.configWidget = configWidget;
		this.displayDefaultView();
		return this;	
	},

	displayDefaultView: function(){
		this.purgeEditing();
		
		var content = this.getContentContainer();
		this.clear();
		this.displayButtons();
		
		if (this.defaultView.deletable){
			this.btnDelete.classList.remove('nm-hidden');
		}
		else {
			this.btnDelete.classList.add('nm-hidden');	
		}
		
		content.appendChild(this.defaultView.configWidget.toElement());
		
		return this;
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
		
		return this.displayDefaultView();
		
		// TODO: REMOVE
		//this.mediator.publish('settingsManager.defaultView', [this]);
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
		
		this.clear();
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
	},
	
	
	setAction: function(action, actionInterface){
		networkMap.SettingsManager.isActionInterface(action, actionInterface);
		this._actions[action] = actionInterface;
		
		return this;
	},	
	
	_runAction: function(action, e){
		if (this._actions[action] === undefined){
			this._action = networkMap.SettingsManager._actions[action];
		}		
		
		if (this._actions[action] !== null && this._actions[action] !== undefined){
			this._action = this._actions[action];	
		}				
		
		if (this._action){
			// let the interface be able to remove the default buttons
			this.displayButtons();
			this._action.addEvent('hideButtons', function(){
				this.hideButtons();
			}.bind(this));
			
			this._action.addEvent('deletable', function(deletable){
				if (deletable){	
					return this.btnDelete.classList.remove('nm-hidden');
				}
				
				return this.btnDelete.classList.add('nm-hidden'); 
			}.bind(this));
			
			this._action.addEvent('cancel', this.previousEdit.bind(this));
			
			this._action.addEvent('addLink', function(e){
				this.mediator.publish('addLink', [e]);
				this.previousEdit();
			}.bind(this));			
			
			var el = this._action.render(e);
			
			if (el){
				this.clear();
				
				this.getContentContainer().appendChild(el);
				this.editing.push(this._action);
			}
			return el;
		}
	},	
	
	add: function(){
		return this._runAction('add');
	},
	
	addNode: function(){
		return this._runAction('addNode');
	},
	
	addLink: function(){
		return this._runAction('addLink');
	},
	
	configure: function(e){
		return this._runAction('configure', e);
	},
	
	delete: function(e){
		return this._runAction('delete', this.editing[this.editing.length - 1].configurationEvent());
	},
	
	modify: function(e){
		return this._runAction('modify', e);
	}
	
	

});


networkMap.SettingsManager._actions = {};

networkMap.SettingsManager.registerAction = function(action, actionInterface){
	networkMap.SettingsManager.isActionInterface(action, actionInterface);
		
	networkMap.SettingsManager._actions[action] = actionInterface;
	
	return true;
};

networkMap.SettingsManager.isActionInterface = function(action, actionInterface){
	if (!networkMap.find(['add', 'delete', 'addNode', 'addLink', 'configure'], function(item){ return item === action; }))
		throw 'Action not implemented: ' + action;
	
	if (!actionInterface.render || !networkMap.isFunction(actionInterface.render)){
		throw 'Class does not implement actionInterface.render for ' + action;
	}
	
	if (!actionInterface.purge || !networkMap.isFunction(actionInterface.purge)){
		throw 'Class does not implement actionInterface.purge for ' + action;
	}
	
	return true;
};
