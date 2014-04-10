networkMap.renderer = networkMap.renderer || {};
networkMap.renderer.settingsManager = networkMap.renderer.settingsManager || {};

networkMap.renderer.settingsManager.AddLink = function(){
	this.el = null;
	this.state = this.states.notRendered;
};

networkMap.extend(networkMap.renderer.settingsManager.AddLink, networkMap.Observable);
networkMap.extend(networkMap.renderer.settingsManager.AddLink, {
	render: function(){
		this.state.render.call(this);
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

networkMap.SettingsManager.registerAction('addLink', new networkMap.renderer.settingsManager.AddLink());
 