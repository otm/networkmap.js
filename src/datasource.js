networkMap.datasource = networkMap.datasource || {};

/**
* url: the URL to make the request to
* requests: array of objects containing request information
* {
*    link: {Sublink},
*    callback: {function}
* }
*/
networkMap.registerDatasource = function(name, f){
	networkMap.datasource[name] = function(url, requests){
		if (typeOf(requests) !== 'array'){
			requests = [requests];
		}
		f(url, requests);
	};
};


networkMap.registerDatasource('simulate', function(url, requests){
	requests.each(function(request){
		var dataPoint = Math.random();

		request.callback({
			url: url,
			request: request.link,
			value: dataPoint,
			realValue: Math.round(dataPoint * 100) + 'Mbps'
		});
	});
});