describe("Link", function() {
	wrapper = document.createElement('div');
	wrapper.id = 'paper';
   document.getElementsByTagName('body')[0].appendChild(wrapper);
   
   var graph = new networkMap.Graph('paper');
	var nodeA = new networkMap.Node({
		graph: graph,
		"id": "nodeA",
		"name": "nodeA",
		"x": "474",
		"y": "96",
		"renderer": "rect",
		"information": {
			"test": "some value"
		},
		"label": {
			"position": "internal",
			"visable": "true"
		},
		"padding": "10"
	});  
	var nodeB = new networkMap.Node({
		graph: graph,
		"id": "nodeB",
		"name": "nodeB",
		"x": "474",
		"y": "96",
		"renderer": "rect",
		"information": {
			"test": "some value"
		},
		"label": {
			"position": "internal",
			"visable": "true"
		},
		"padding": "10"
	}); 
	var nodeC = new networkMap.Node({
		graph: graph,
		"id": "nodeC",
		"name": "nodeC",
		"x": "474",
		"y": "96",
		"renderer": "rect",
		"information": {
			"test": "some value"
		},
		"label": {
			"position": "internal",
			"visable": "true"
		},
		"padding": "10"
	});  
	graph.addNode(nodeA);
	graph.addNode(nodeB);
	graph.addNode(nodeC);
	var linkAB = new networkMap.Link({
		graph: graph,
		"inset": "10",
		"connectionDistance": "10",
		"staticConnectionDistance": "30",
		"arrowHeadLength": "10",
		"width": "10",
		"background": "#777",
		"nodeA": {
			"id": "nodeA",
								"name": "TenGigabitEthernet3\/3",
					"requestUrl": "\/rpc.php?call=get.data.last",
					"requestData": {
						"column": "2",
						"multiplier": "8",
						"hb": "300",
						"speed": "10000"
					}
			},
			"nodeB": {
				"id": "nodeB",
				
							"name": "TenGigabitEthernet3\/3",
							"requestUrl": "\/rpc.php?call=get.data.last",
							"requestData": {
								
								"column": "1",
								"multiplier": "8",
								"hb": "300",
								"speed": "10000"
							}
			}
		});	
	
	graph.addLink(linkAB);
	
	beforeEach(function () {  
		
	});  
	
	it("connectedTo", function() {
		expect(linkAB.connectedTo(nodeA)).toEqual(true);
		expect(linkAB.connectedTo(nodeB)).toEqual(true);
		expect(linkAB.connectedTo(nodeC)).toEqual(false);
		expect(linkAB.connectedTo(nodeA, nodeB)).toEqual(true);
		expect(linkAB.connectedTo(nodeA, nodeC)).toEqual(false);
		expect(linkAB.connectedTo(nodeC, nodeA)).toEqual(false);
		expect(linkAB.connectedTo(nodeC)).toEqual(false);
	});
	
	
});