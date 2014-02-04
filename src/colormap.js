
networkMap.colormap = networkMap.colormap || {};


/**
 * Register a color map. After a color map is registed
 * it can be used in the graph. 
 *
 * @param {String} The name of the colormap
 * @param {Object} colormap
 * @param {array} colormap.map The color values
 * @param {array} colormap.limits The limits associated with colormap.map
 * @param {string} colormap.nodata The color if no data is available
 * @param {function} colormap.translate(value) A function that takes a value [0:1|undefined] and returns a color
 */
networkMap.registerColormap = function(name, colormap){
	networkMap.colormap[name] = colormap;
};

/**
 * Rasta5 colormap
 */
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

/**
 * Flat5 colormap
 */
networkMap.colormap.flat5 = {
	translate: function(value){
		var map = networkMap.colormap.flat5;
		if (!value && value !== 0)
			return map.nodata;
	
		if (value === 0)
			return map.map[0];

		if (value < 0.2)
			return map.map[1];

		if (value < 0.4)
			return map.map[2];

		if (value < 0.6)
			return map.map[3];
		
		if (value < 0.8)
			return map.map[4];
		
		return map.map[5];
	},
	map: [
		'#000000',
		'#27ae60',
		'#2ecc71',
		'#f1c40f',
		'#e67e22',
		'#c0392b'
	],
	limits: [
		0,
		0.2,
		0.4,
		0.6,
		0.8,
		1
	],
	nodata: '#ecf0f1'
};

/**
 * HSL colormap
 */
networkMap.colormap.hsl15 = {
	translate: function(value){
		var map = networkMap.colormap.hsl15;
		
		if (!value && value !== 0)
			return map.nodata;
	
			
	
		if (value === 0)
			return map.map[0];

		
		var hue = 220 - (Math.floor(value * 24) * 10);
		if (hue < 0) {
			hue = 360 - hue;
		}
		return "hsl(" + hue + ", 100%, 50%)";
	},
	map: [
		'#05f',
		'#007fff',
		'#0af',
		'#00d4ff',
		'#0ff',
		'#0fa',
		'#00ff80',
		'#0f5',
		'#00ff2b',
		'#0f0',
		'#5f0',
		'#80ff00',
		'#af0',
		'#d4ff00',
		'#ff0',
		'#fa0',
		'#ff8000',
		'#f50',
		'#ff2b00',
		'#f00',
		'#f05'
	],
	limits: [
		0, //#05f
		0.05, //#007fff
		0.1, //#0af
		0.15, //#00d4ff
		0.2, //#0ff
		0.25, //#0fa
		0.3, //#00ff80
		0.35, //#0f5
		0.4, //#00ff2b
		0.45, //#0f0
		0.5, //#5f0
		0.55, //#80ff00
		0.6, //#af0
		0.65, //#d4ff00
		0.7, //#ff0
		0.75, //#fa0
		0.8, //#ff8000
		0.85, //#f50
		0.9, //#ff2b00
		0.95, //#f00
		1		//#f05
	],
	nodata: '#ecf0f1'
};