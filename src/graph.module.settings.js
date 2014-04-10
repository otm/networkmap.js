networkMap.Graph.Module = networkMap.Graph.Module || {};

networkMap.Graph.Module.Settings = function(nodeProperties, linkProperties, graphProperties){
	this.nodeProperties = nodeProperties;
	this.linkProperties = linkProperties;
	this.graphProperties = graphProperties;
};

// types: angle, bool, float, int, number, length, list, string, color
// https://api.tinkercad.com/libraries/1vxKXGNaLtr/0/docs/topic/Shape+Generator+Overview.html
networkMap.extend(networkMap.Graph.Module.Settings, {
	toElement: function(nodeProperties, linkProperties, graphProperties){
		nodeProperties = nodeProperties || this.nodeProperties;
		linkProperties = linkProperties || this.linkProperties;
		graphProperties = graphProperties || this.graphProperties;		
		
		var container = new networkMap.widget.Accordion();
		
		var nodeConfiguration = new networkMap.Node.Module.Settings(nodeProperties, {
			onlyGlobals: true,
			header: 'Node Defaults',
			container: container
		});
		
		var linkConfiguration = new networkMap.Link.Module.Settings(linkProperties, {
			onlyGlobals: true,
			header: 'Link Defaults',
			container: container
		});		
		
		var accordionGroup;

		var changeHandler = function(defaults, key){
			return function(e, widget){
				defaults.set(key, widget.value());
			}.bind(this);
		}.bind(this);
	
		accordionGroup = container.add('Globals');
		accordionGroup.appendChild(new networkMap.widget.GridInput('Grid', {
			enabled: graphProperties.get('gridEnabled'),
			grid: graphProperties.get('grid')
		}).addEvent('change', function(e){
				graphProperties.set({'grid': e.value.grid, 'gridEnabled': e.value.enabled});	
		}.bind(this)));
		
		nodeConfiguration.toElement();
		linkConfiguration.toElement();
				
		this.el = container;
		
		return container;
	}
});