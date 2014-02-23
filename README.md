A network weathermap UI Library built with SVG.

![screenshot](resources/fig/networkmap.png)

The configuration can be done by:
* a JSON file which is load from the server
* a Javascript object
* using the API

It is possible to inject a custom UI to aid the user when creating the 
networkmap directly in the browser. Most of the configuration of the 
networkmap can be done directly in the browser and in addion the JSON
format makes it easy to parse and update the configuration.

A minimal setup is done by:

```javascript
	var map;
	window.addEvent('load', function(){
		map = new networkMap.Graph('paper').load('/spec/weathermap.json');
	});
```

```html
	<div id="paper"></div>
```

An example configuration file is found in spec/weathermap.json


## networkmap.Graph class
This class extends networkMap.Observable and networkMap.Mediator.

### Constructor
| Constructor 								| Description											|
|-------------------------------------------|-------------------------------------------------------|
| Graph(target:Node, options:[GraphOptions](#GraphOptions))	| Creates a new graph inside the given HTML container 	|

### Methods
| Methods							| Return value		| Description													|
|-----------------------------------|-------------------|---------------------------------------------------------------|
| setRefreshInterval(interval:numer)| self				| Sets the periodic refresh interval in seconds. O to disable.	|
| getSvg()							| SVG.doc 			| Returns the SVG node where the graph is rendered.				|
| getPaintArea()					| SVG.G 			| Return the SVG group where the graph is rendered.				|
| grid(options:[GridOptions](#GridOptions))	| self		| Set drag-grid size											|
| load(obj:string&#124;[GraphConfiguration](#GraphConfiguration))| self				| Load a map from configuration. If string is given it is assumed to be an URL to do an GET request from			|
| getGraphConfiguration()			| [GraphConfiguration](#GraphConfiguration) | Get the current GraphConfiguration 	|
| save([SaveOptions](#SaveOptions))	| self				| Save the current GraphConfiguration 							|
| setOptions(options:[GraphOptions](#GraphOptions)) | self | 															|
| registerLinkGenerator(component:string, f:function) | none | Register a function that generates an href string for either [Node](#Node) or [Link](#Link). |
| getNode(id:string)				| [Node](#Node)		| 																|
| getLinks(node:string&#124;[Node](#Node), sibling:string&#124;[Node](#Node)) | Array | Returns an array of links that are connected to the nodes. |
| update()							| self				| This will force the graph to fetch data from the server and update the colors |
| ~~enableEditor~~					|					|																|
| ~~disableEditor~~					|					|																|
| ~~enableDraggableNodes~~			|					|																|
| ~~disableDraggableNodes~~			|					|																|

### Properties
| Properties						| Type				| Description													|
|-----------------------------------|-------------------|---------------------------------------------------------------|
| defaults.node 					| [Properties](#Properties) | The default node options for the graph instance. Inherits defaults from [Node.defaults](#Node.defaults) |
| defaults.link 					| [Properties](#Properties) | The default link options for the graph instance. Inherits defaults from [Link.defaults](#Link.defaults) |

### Events
| Events							| Arguemnts			| Description													|
|-----------------------------------|-------------------|---------------------------------------------------------------|
| load 								| none				| This event is fired when a graph has loaded configuration 	|


### networkMap.GraphOptions object specification
| Properties						| Type				| Description													|
|-----------------------------------|-------------------|---------------------------------------------------------------|
| datasource						| string			| The name of the datasource to load data with					|
| colormap							| string			| The name of the colormap (legend) to use in the map.			|
| editor							| boolean			| The enabled/disabled state of the graph editor. Default value is true. |
| ~~enableEditor~~					| 					|																|
| draggableNodes					| boolean			| If true, nodes can be dragged. Default value is false.
| ~~enableDraggableNodes~~			|					|																|
| update							| boolean			| The enable/disable state for automatic updates of graph values|
| updateOptions						| [UpdateOptions](#UpdateOptions) | The graph update options.						|
| ~~refreshInterval~~
| grid								| boolean			| The enable/disable of the snap to grid when dragging objects	|
| gridOptions						| [GridOptions](#GridOptions) | The snap-to-grid options							|
| nodeOptions						| [NodeOptions](#NodeOptions) | The default node options to use for the graph instance |
| linkOptions						| [LinkOptions](#LinkOptions) | The default link options to use for the graph instance |
| save								| boolean			| The enable/disable if it is possible to save the graph		|
| SaveOptions						| [SaveOptions](#SaveOptions) | The options that controls how the graph configuration is dumped and saved. |

### networkMap.GridOptions object specification
| Properties						| Type				| Description													|
|-----------------------------------|-------------------|---------------------------------------------------------------|
| x									| number			| The width of the grid in horizontal direction					|
| y 								| number			| The hight of the grid in vertical direction					|

### networkMap.UpdateOptions object specification
| Properties						| Type				| Description													|
|-----------------------------------|-------------------|---------------------------------------------------------------|
| interval							| numeric			| The interval, in seconds, to control how often the graph updates (fetch) data from the server. Default value is 300. |
| batchUpdate						| boolean			| The enable/disable state of batch updates of data from the server. Default value is true. |


## networkMap.GraphConfiguration object specification
| Properties						| Type				| Description													|
|-----------------------------------|-------------------|---------------------------------------------------------------|

### networkMap.NodeOptions object specification
| Properties						| Type				| Description													|
|-----------------------------------|-------------------|---------------------------------------------------------------|

### networkMap.LinkOptions object specification
| Properties						| Type				| Description													|
|-----------------------------------|-------------------|---------------------------------------------------------------|

### networkMap.SaveOptions object specification
| Properties						| Type				| Description													|
|-----------------------------------|-------------------|---------------------------------------------------------------|











## networkmap.Node class
This class extends [Observable](#networkMap.Observable)

### Constructor
| Constructor 								| Description											|
|-------------------------------------------|-------------------------------------------------------|
| Node(options:[NodeOptions](#NodeOptions))	| Creates a new node. If a graph is specified the node is added to the graph. Note that the possition must be set for the node to display. |


### Methods
| Methods							| Return value		| Description													|
|-----------------------------------|-------------------|---------------------------------------------------------------|
| getConfiguration()				| [NodeConfiguration](#networkMap.NodeConfiguration) | Get the current node configuration. |
| setGraph(graph:[Graph](#networkMap.Graph)) | self		| Renders the node on the specified graph. If graph is set to null the node will be removed. |

### Events
| Events							| Arguemnts			| Description													|
|-----------------------------------|-------------------|---------------------------------------------------------------|
| dragstart
| drag
| dragend
| requestHref
|

### Node.defaults object specifications
This object is an instance of [Properties](#networkMap.Properties). Note: the properties must be accessed with get/set methods.

| Properties						| Type				| Default value	|
|-----------------------------------|-------------------|---------------|
| id								| string			| undefined		|
| name								| string			| undefined		|
| comment							| string			| undefined		|
| x									| numeric			| 10			|
| y									| numeric			| 10			|
| lat								| numeric			| null			|
| lng								| numeric			| null			|
| fontFamily						| string			| 'Helvetica'	|
| fontSize							| numeric			| 16			|
| bgColor							| string			| '#dddddd'		|
| strokeColor						| string			| '#000000'		|
| strokeWidth						| numeric			| 2				|
| label								| [NodeLabelOptions](#NodeLabelOptions) | - |
| renderer							| [NodeRedererId](#NodeRedererId) | RECT |
| padding							| numeric			| 10			|
| href								| string			| null			|
| draggable							| boolean			| false			|









## networkmap.Link class
This class extends networkMap.Observable.

### Constructor
| Constructor 								| Description											|
|-------------------------------------------|-------------------------------------------------------|
| Link(options:[LinkOptions](#LinkOptions))	| Creates a new graph. Creates a new node. If a graph is specified the node is added to the graph. Note that two nodes must be set for the link to display. |

### Methods
| Methods							| Return value		| Description													|
|-----------------------------------|-------------------|---------------------------------------------------------------|
| getNode(link:[SubLink](#networkMap.SubLink)) | [Node](#networkMap.Node) | Get the node that the sublink is associated with |
| connectedTo(node:string&#124;[Node](#Node), sibling:string&#124;[Node](#Node)) | boolean | 							|
| getConfiguration()				| [NodeConfiguration](#networkMap.NodeConfiguration) | Get the current link configuration. |
| setGraph(graph:[Graph](#networkMap.Graph)) | self		| Renders the link on the specified graph. If graph is set to null the node will be removed. |
| showPath()						| self				| Show the link													|
| hidePath()						| self				| Hide the link													|
| showShadowPath					| self				| Show the links shaddow path									|
| hideShadowPath					| self				| Hide the links shaddow path									|
| update(force:boolean)				| self				| The link will call the datasource to update on the screen.	|


### Properties
| Properties						| Type				| Description													|
|-----------------------------------|-------------------|---------------------------------------------------------------|

### Events
| Events							| Arguemnts			| Description													|
|-----------------------------------|-------------------|---------------------------------------------------------------|
| requestHref


### Link.defaults object specification
This object is an instance of [Properties](#networkMap.Properties). Note: the properties must be accessed with get/set methods.

| Properties						| Type				| Default value	|
|-----------------------------------|-------------------|---------------|
| inset								| numeric			| 10			|
| connectionDistance				| numeric			| 10			|
| staticConnectionDistance			| numeric			| 30			|
| arrowHeadLength					| numeric			| 10			|
| width								| numeric			| 10			|
| background						| string			| '#777'		|
| update**							| boolean			| true			|
| updateOptions						| [Link.UpdateOptions](#Link.UpdateOptions) | 			|
| datasource						| string 			| 'simulate'	|
| colormap							| string			| 'flat5'		|













## networkmap.Link class
This class extends networkMap.Observable and networkMap.Mediator.

### Constructor
| Constructor 								| Description											|
|-------------------------------------------|-------------------------------------------------------|
| Graph(target:Node, options:[GraphOptions](#GraphOptions))	| Creates a new graph inside the given HTML container 	|

### Methods
| Methods							| Return value		| Description													|
|-----------------------------------|-------------------|---------------------------------------------------------------|

### Properties
| Properties						| Type				| Description													|
|-----------------------------------|-------------------|---------------------------------------------------------------|

### Events
| Events							| Arguemnts			| Description													|
|-----------------------------------|-------------------|---------------------------------------------------------------|

### GraphOptions object specification
| Properties						| Type				| Description													|
|-----------------------------------|-------------------|---------------------------------------------------------------|















## Integration
As weathermaps are usually integrated in other tools there is no backend in NetworkMap.js. 
There is however an example implementation in ```spec/update.php``` that is used in 
development to test the save functionality. Use it in production at your own risk!!!

### Populating data in the weathermap
To fetch data you need to register a datasource with ```networkMap.registerDatasource(name, function)```

The function can takes two parameters
#### url 
This is the requestUrl that is defined in the configuration.

#### requests
This is an array of objects that containing two properties (data and callback). The property data 
contains the information from requestData in the configuration and the property callback contains a 
function that should be called when the data is retreived. 

The request array structure
```javascript
[
	{
		data: {...},
		callback: function(url, request, value, realvalue)
	}
]
```

A simple dummy example of the simulations datasource that is included
```javascript
networkMap.registerDatasource('simulate', function(url, requests){
	requests.each(function(request){
		var dataPoint = Math.random();

		request.callback({
			url: url,
			request: request.data,
			value: dataPoint,
			realValue: Math.round(dataPoint * 100) + 'Mbps'
		});
	});
});
```

### Saving changes
To enable users change and create network maps there is an interface to handle this. This is done 
by ```networkMap.SettingsManager```, however the only configuration that is needed is to setup the ``onSave`` 
block in the configuration. 

#### method
This is the method the data is sent to the server.
Valid values are:
* post (default)
* get

#### url
The url to send the reqest to.

#### data
Here you are free to populate whatever information you are required to handle this on the backend.

Example configurtion:
```javascript
"onSave": {
	"method": "post",
	"url": "update.php",
	"data": {
		"id": "weathermap.json"
	}
}
```

The server should return an JSON envoded object

Status for a save that worked
```javascript
{
	"status": "ok",
	"error": null
}
```

If an error occurred
```javascript
{
	"status": "nok",
	"error": "error string"
}
```

## GridOptions        
Test

# Build

## Set up build envionment
This installation assumes that node.js and npm is installed

* npm install

## Build from source
* grunt

## Development
* grunt watch

## Installing packages for development
This will automaticly add files to package.json
* npm install <package> --save-dev

## Adding New Javascript Files
To make the concatenation work you need to add the file to ```Gruntfile.js```

# networkMap
The only object that will polute the global object

## networkMap.datasorce
Internal object that keeps track of datasources. The project ships with one datasource `simulate` which is used for testing. To add new datasources use `networkMap.registerDatasource(name, datasouce)`

### networkMap.registerDatasource(name, datasouce) ###

#### name
The name of the datasource to register. 

#### datasource
The datasource is a function that takes to values, `url` and `requests`. Where `requests` is an object containing the `data`property` and a `callback` property. As the interface between the link renderer and datasource is not specified please see documentation for the datasource you whish to integrate against. 


## networkMap.colormap

### networkMap.registerColormap(name, colormap)

### Predefined colormaps

#### rasta5
#### flat5

## networkMap.ColorLegend
Internal object that creates and inserts the legend for colors in the graph


## networkMap.Graph

Example:
```html
	<div id="paper"></div>
```

```javascript
new networkMap.Graph('paper').load('/weathermap.json')
