networkMap.drawingCallbacks = networkMap.drawingCallbacks || {};

/**
 * Register a drawing callback
 *
 * @param {string} name The name of the drawing callback used in node options.
 * @param {function} f The callback to do svg drawing.
 */
networkMap.registerDrawingCallback = function(name, f){
	networkMap.drawingCallbacks[name] = f;
};
