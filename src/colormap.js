
networkMap.colormap = networkMap.colormap || {};


networkMap.registerColormap = function(name, colormap){
	networkMap.colormap[name] = colormap;
};

networkMap.colormap.rasta5 = {
	translate: function(value){
		if (!value)
			return networkMap.colormap.rasta5.nodata;

		if (value < 0.2)
			return networkMap.colormap.rasta5.map[0];

		if (value < 0.4)
			return networkMap.colormap.rasta5.map[1];

		if (value < 0.6)
			return networkMap.colormap.rasta5.map[2];
		
		if (value < 0.8)
			return networkMap.colormap.rasta5.map[3];
		
		return networkMap.colormap.rasta5.map[4];
	},
	map: [
		'#3DDE1E',
		'#9BEC1A',
		'#F9EB18',
		'#F98020',
		'#F51329'
	],
	limits: [
		0.2,
		0.4,
		0.6,
		0.8,
		1
	],
	nodata: '#C0C0C0'
};

networkMap.colormap.flat5 = {
	translate: function(value){
		var map = networkMap.colormap.flat5;
		if (!value)
			return map.nodata;

		if (value < 0.2)
			return map.map[0];

		if (value < 0.4)
			return map.map[1];

		if (value < 0.6)
			return map.map[2];
		
		if (value < 0.8)
			return map.map[3];
		
		return map.map[4];
	},
	map: [
		'#27ae60',
		'#2ecc71',
		'#f1c40f',
		'#e67e22',
		'#c0392b'
	],
	limits: [
		0.2,
		0.4,
		0.6,
		0.8,
		1
	],
	nodata: '#ecf0f1'
};
