networkMap.Properties = function(properties, defaults){
	this.properties = properties || {};
	this.$change = [];
	this.setDefaults(defaults);
};

networkMap.extend(networkMap.Properties, networkMap.Observable);

networkMap.extend(networkMap.Properties, {
	get: function(k, inherited){
		var v = this.properties;
		
		for(var i = 0,path = k.split('.'),len = path.length; i < len; i++){
			if(!v || typeof v !== 'object') break;
			v = v[path[i]];
		}

		if (inherited === true){
			return {
				value: v,
				inherited: (this.defaults) ? this.defaults.get(k) : void 0
			};
		}

		if (v === void 0 && this.defaults !== void 0)
			v = this.defaults.get(k);

		return v;
	},

	set: function(k, v){
		
		this.$change.length = 0;
		if (arguments.length === 1 && arguments[0].constructor ===  Object){
			networkMap.each(arguments[0], this.$set, this);
		}
		else{
			this.$set(v, k);
		}
		this.fireEvent('change', [this.$change]);
		return this;
	},

	$set: function(v, k){
		var change = {
			key: k,
			value: v,
			oldValue: this.properties[k]
		};
		this.properties[k] = v;
		this.$change.push(change);
		return change;
	},

	unset: function(k){
		var oldValue = this.properties[k];
		delete this.properties[k];
		this.fireEvent('change', [k, v, oldValue]);
		return this;
	},

	load: function(properties){
		var change = [];
		var oldProperties = this.properties;
		networkMap.each(properties, function(k, v){
			change.push({
				key: k, 
				value: v,
				oldValue: oldProperties[k]
			});
		});

		this.properties = properties;
		this.$change = change;

		this.fireEvent('change', [change]);
		return this;
	},

	extract: function(){
		return this.properties;
	},

	setDefaults: function(defaults){
		this.defaults = defaults || void 0;

		// propagate change events
		if (this.defaults){
			this.defaults.addEvent('change', function(change){
				this.fireEvent('change', [change]);
			}.bind(this));
		}
	},

	configuration: function(properties){
		properties = properties || {};
		if (this.defaults === void 0)
			return networkMap.defaults(properties, this.properties);

		return networkMap.defaults(properties, this.properties, this.defaults.configuration());
	}
});
