networkMap.renderer = networkMap.renderer || {};

networkMap.renderer.settingsManager.Modify = function(){
	this.el = null;
	this.state = this.states.notRendered;
};

networkMap.extend(networkMap.renderer.settingsManager.Modify, networkMap.Observable);
networkMap.extend(networkMap.renderer.settingsManager.Modify, {
	render: function(e){
		this.state.render.call(this, e);
	},
	
	purge: function(){
		this.state.purge.call(this);		
	},
	
	states: {
		rendered: {
			render: function(e){
				return this.el;	
			},
			purge: function(){
				// Clean up HTML
				this.state = this.states.notRendered;
			}
		},
		
		notRendered: {
			render: function(){
				// Render HTML
				this.state = this.states.rendered;
			},
			purge: function(){
				return true;
			}
		}
	}
});

networkMap.SettingsManager.registerAction('modify', new networkMap.renderer.settingsManager.Modify());
 