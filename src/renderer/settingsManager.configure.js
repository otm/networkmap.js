networkMap.renderer = networkMap.renderer || {};

networkMap.renderer.settingsManager.Configure = function(){
	/** The element that should be rendered */
	this.el = null;
	
	/** The configuration event */
	this.e = null;
	
	/** The current state in the state machine */
	this.state = this.states.notRendered;
};

networkMap.extend(networkMap.renderer.settingsManager.Configure, networkMap.Observable);
networkMap.extend(networkMap.renderer.settingsManager.Configure, {
	render: function(e){
		return this.state.render.call(this, e);
	},
	
	purge: function(){
		return this.state.purge.call(this);		
	},
	
	configurationEvent: function(){
		return this.e;
	},
	
	states: {
		rendered: {
			render: function(e){	
				return this.el;	
			},
			purge: function(){
				// TODO: We should call a clean up method here
				this.el = null;
				this.state = this.states.notRendered;
			}
		},
		
		notRendered: {
			render: function(e){
				this.e = e;
				if (e.deletable){
					this.fireEvent('deletable', [true]);
				}
				else {
					this.fireEvent('deletable', [false]);
				}
				
				// Use the provided conf element
				if (e.configWidget.toElement){
					this.el = document.createElement('div');
					this.el.appendChild(e.configWidget.toElement());
				}
				else{ 
					// If we can not configure it we will not do it...
					return null;	
				}
				this.state = this.states.rendered;
				return this.el;
				
			},
			purge: function(){
				return true;
			}
		}
	}
});

networkMap.SettingsManager.registerAction('configure', new networkMap.renderer.settingsManager.Configure());