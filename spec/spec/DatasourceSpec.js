describe("Simulate Datasource", function() {
	var singleRequest;
	var multipleRequest;
	var url = '/test/request';
	
	it("handle single requests", function() {
		singleRequest = {
				data: {},
				callback: function(result){
					expect(result.value).toBeGreaterThan(0);
				}
		};
		networkMap.datasource.simulate(url, singleRequest);
	});
	
	it("handle multiple requests", function() {
		var count = 0;
		multipleRequests = [{
			data: {},
			callback: function(result){
				expect(result.value).toBeGreaterThan(0);
				count += 1;
			}
		},
		{
			data: {},
			callback: function(result){
				expect(result.value).toBeGreaterThan(0);
				count += 1;
			}
		}];
		networkMap.datasource.simulate(url, multipleRequests);
		expect(count).toEqual(2);
	});
});
	
