networkMap.renderer = networkMap.renderer || {};
networkMap.renderer.settingsManager = networkMap.renderer.settingsManager || {};

networkMap.renderer.settingsManager.Add = function(){
	
};

networkMap.extend(networkMap.renderer.settingsManager.Add, networkMap.Observable);
networkMap.extend(networkMap.renderer.settingsManager.Add, {
	render: function(){
		
	},
	
	purge: function(){
		
	},
	
	toElement: function(){
		
	}
});
 
networkMap.SettingsManager.registerAction('add', new networkMap.renderer.settingsManager.Add());
