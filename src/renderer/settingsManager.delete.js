networkMap.renderer = networkMap.renderer || {};
networkMap.renderer.settingsManager = networkMap.renderer.settingsManager || {};

networkMap.renderer.settingsManager.Delete = function(){
	this.el = null;
	this.state = this.states.notRendered;
};

networkMap.extend(networkMap.renderer.settingsManager.Delete, networkMap.Observable);
networkMap.extend(networkMap.renderer.settingsManager.Delete, {
	render: function(e){
		this.state.render.call(this, e);
	},
	
	purge: function(){
		this.state.purge.call(this);		
	},
	
	states: {
		rendered: {
			render: function(){
				return this.el;	
			},
			purge: function(){
				// Clean up HTML
				this.state = this.states.notRendered;
			}
		},
		
		notRendered: {
			render: function(e){
				if (e.deletable && window.confirm('Are you sure you want to delete the ' + e.type + ' ' + e.targetName)){
						e.destroy();
				}
				
				return null;
			},
			purge: function(){
				return true;
			}
		}
	}
});

networkMap.SettingsManager.registerAction('delete', new networkMap.renderer.settingsManager.Delete());
 