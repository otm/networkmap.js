networkMap.events = networkMap.events || {
	click: function(e, click){
		if (click.href){
			window.location.href = click.href;
		}
	}
};

networkMap.registerEvent = function(name, f){
	if (!networkMap.events[name])
		throw "Invalid event: " + name + " is not an registered event";
		
	networkMap.events[name] = function(e){
		var click = e.target.instance.link;
		f(e, click);
	};
};

networkMap.registerEvent('click', networkMap.events.click);