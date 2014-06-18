networkMap.event = networkMap.event || {};

networkMap.event.Configuration = function(options){
	this.deletable = (options.deletable) ? true : false;
	this._destroy = (options.destroy) ? options.destroy : function(){ return false; };
	this._cancel = (options.cancel) ? options.cancel : function(){ return false; };
	this.editable = (options.editable) ? true : false;
	this.editWidget = (options.editWidget) ? options.editWidget : null;
	this.target = (options.target) ? options.target : null;
	this.type = (options.type) ? options.type : 'unknown';

	// TODO: Depricated, remove	
	this.configWidget = this.editWidget;
};

networkMap.extend(networkMap.event.Configuration, {
	
	destroy: function(){
		return this._destroy();
	},
	
	cancel: function(){
		return this._cancel();
	}
	
	
});