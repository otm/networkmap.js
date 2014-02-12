networkMap.datasource = networkMap.datasource || {};

/**
 * Register a datasource
 *
 * @param {string} name The name of the datasource.
 * @param {function} f The datasource
 */
networkMap.registerDatasource = function(name, f){
	networkMap.datasource[name] = function(url, requests){
		if (Object.prototype.toString.call(requests) !== '[object Array]'){
			requests = [requests];
		}
		f(url, requests);
	};
};

/**
 * Dummy datasource used for simulation and testing.
 * The requests array contains object of the form:
 * {
 *		link: {Sublink} 
 *		callback: {function}
 * }
 * Use the link to gather data to send with the request,
 * when the request is made send the data to the callback.  
 *
 * @param {string} url The URL to send the request to.
 * @param {Array} requests An array of requests. 
 * @return null.
 */
networkMap.registerDatasource('simulate', function(url, requests){
	requests.forEach(function(request){
		var dataPoint = Math.random();

		// Example on how to get the node to get node specific data
		//request.link.getNode().options.id;

		request.callback({
			url: url,
			request: request.link,
			value: dataPoint,
			realValue: Math.round(dataPoint * 100) + 'Mbps'
		});
	});
});