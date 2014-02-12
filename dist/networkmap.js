/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2014-01-31
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

if ("document" in self && !("classList" in document.createElement("_"))) {

(function (view) {

"use strict";

if (!('Element' in view)) return;

var
	  classListProp = "classList"
	, protoProp = "prototype"
	, elemCtrProto = view.Element[protoProp]
	, objCtr = Object
	, strTrim = String[protoProp].trim || function () {
		return this.replace(/^\s+|\s+$/g, "");
	}
	, arrIndexOf = Array[protoProp].indexOf || function (item) {
		var
			  i = 0
			, len = this.length
		;
		for (; i < len; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	}
	// Vendors: please allow content code to instantiate DOMExceptions
	, DOMEx = function (type, message) {
		this.name = type;
		this.code = DOMException[type];
		this.message = message;
	}
	, checkTokenAndGetIndex = function (classList, token) {
		if (token === "") {
			throw new DOMEx(
				  "SYNTAX_ERR"
				, "An invalid or illegal string was specified"
			);
		}
		if (/\s/.test(token)) {
			throw new DOMEx(
				  "INVALID_CHARACTER_ERR"
				, "String contains an invalid character"
			);
		}
		return arrIndexOf.call(classList, token);
	}
	, ClassList = function (elem) {
		var
			  trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
			, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
			, i = 0
			, len = classes.length
		;
		for (; i < len; i++) {
			this.push(classes[i]);
		}
		this._updateClassName = function () {
			elem.setAttribute("class", this.toString());
		};
	}
	, classListProto = ClassList[protoProp] = []
	, classListGetter = function () {
		return new ClassList(this);
	}
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
	return this[i] || null;
};
classListProto.contains = function (token) {
	token += "";
	return checkTokenAndGetIndex(this, token) !== -1;
};
classListProto.add = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		if (checkTokenAndGetIndex(this, token) === -1) {
			this.push(token);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.remove = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		var index = checkTokenAndGetIndex(this, token);
		if (index !== -1) {
			this.splice(index, 1);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.toggle = function (token, force) {
	token += "";

	var
		  result = this.contains(token)
		, method = result ?
			force !== true && "remove"
		:
			force !== false && "add"
	;

	if (method) {
		this[method](token);
	}

	return !result;
};
classListProto.toString = function () {
	return this.join(" ");
};

if (objCtr.defineProperty) {
	var classListPropDesc = {
		  get: classListGetter
		, enumerable: true
		, configurable: true
	};
	try {
		objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
	} catch (ex) { // IE 8 doesn't support enumerable:true
		if (ex.number === -0x7FF5EC54) {
			classListPropDesc.enumerable = false;
			objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
		}
	}
} else if (objCtr[protoProp].__defineGetter__) {
	elemCtrProto.__defineGetter__(classListProp, classListGetter);
}

}(self));

}
;var networkMap = networkMap || {};

networkMap.path = function(svg){
	return svg.path().attr({ 
		fill: 'none',
		stroke: '#000'
	});
};

networkMap.find = function(arr, fn){	
	for (var i = 0, len = arr.length; i < len; i++){
		if (fn.call(arr, arr[i], i, arr)){
			return arr[i];
		}
	}
};

networkMap.isFunction = function(f){
	var getType = {};
	return f && getType.toString.call(f) === '[object Function]';
};

networkMap.extend = function () {
	var modules, methods, key, i;
	
	/* get list of modules */
	modules = [].slice.call(arguments);
	
	/* get object with extensions */
	methods = modules.pop();
	
	for (i = modules.length - 1; i >= 0; i--)
		if (modules[i])
			for (key in methods)
				modules[i].prototype[key] = methods[key];
};

networkMap.Observable = (function(){
	function removeOn(string){
		return string.replace(/^on([A-Z])/, function(full, first){
			return first.toLowerCase();
		});
	}

	return {
		addEvent: function(type, fn) {
			this.$events = this.$events || {};

			if (!networkMap.isFunction(fn)){
				return this;
			}

			type = removeOn(type);

			(this.$events[type] = this.$events[type] || []).push(fn);

			return this;
		},

		addEvents: function(events){
			for (var type in events) this.addEvent(type, events[type]);
			return this;
		},

		fireEvent: function(type, args, delay) {
			this.$events = this.$events || {};
			type = removeOn(type);
			var events = this.$events[type];

			if (!events) return this;
			
			args = (args instanceof Array) ? args : [args];

			events.forEach(function(fn){
				if (delay) setTimeout(function() { fn.apply(this, args); }, delay);
				else fn.apply(this, args);
			}, this); 

			return this;
		},	
		
		removeEvent: function(type, fn) {
			type = removeOn(type);

			var events = this.$events[type] || [];
			var index = events.indexOf(fn);
			if (index !== -1) events.splice(index, 1);

			return this;
		},

		removeEvents: function(events){
			var type;
			if (typeof(events) == 'object'){
				for (type in events) this.removeEvent(type, events[type]);
				return this;
			}

			if (events) events = removeOn(events);
			for (type in this.$events){
				if (events && events != type) continue;
				var fns = this.$events[type];
				for (var i = fns.length; i--;) if (i in fns){
					this.removeEvent(type, fns[i]);
				}
			}
			return this;
		}

	};

})();

networkMap.keys = function(obj) {
	var keys = [], key;

	if (obj !== Object(obj)) return keys;
	if (Object.keys) return Object.keys(obj);	
	for (key in obj) if (hasOwnProperty.call(obj, key)) keys.push(key);
	return keys;
};


networkMap.each = function(obj, iterator, context) {
	var i, length;
	if (obj === null) return obj;
	if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
		obj.forEach(iterator, context);
	} else if (obj.length === +obj.length) {
		for (i = 0, length = obj.length; i < length; i++) {
			iterator.call(context, obj[i], i, obj);
		}
	} else {
		var keys = networkMap.keys(obj);
		for (i = 0, length = keys.length; i < length; i++) {
			iterator.call(context, obj[keys[i]], keys[i], obj);
		}
	}
	return obj;
};


/**
 * Extend an object with defaults
 * @param  {Object} obj The object to extend with defaults
 * @param {...Object} var_args Objects with default configuration
 * @return {Object}     The extended object
 */
networkMap.defaults = function(obj) {
	obj = obj || {};
	networkMap.each(Array.prototype.slice.call(arguments, 1), function(source) {
		if (source) {
			for (var prop in source) {
				if (obj[prop] === void 0) obj[prop] = source[prop];
			}
		}
	});
	return obj;
};

networkMap.Options = {
	setOptions: function(options){
		this.options = networkMap.defaults(options, this.options);
		return this;
	}
};

networkMap.Mediator = {
	
	subscribe: function(topic, fn){
		if (!networkMap.isFunction(fn)){
			return this;
		}

		this.$topics = this.$topics || {};
		(this.$topics[topic] = this.$topics[topic] || []).push(fn);

		return this;  
	},

	publish: function(topic, args, delay){
		this.$topics = this.$topics || {};
		var events = this.$topics[topic];

		if (!events) return this;
		
		args = (args instanceof Array) ? args : [args];

		events.forEach(function(fn){
			if (delay) setTimeout(function() { fn.apply(this, args); }, delay);
			else fn.apply(this, args);
		}, this); 

		return this;
	},

	unsubscribe: function(topic, fn){
		var events = this.$topics[topic];
		var index = events.indexOf(fn);
		if (index !== -1) events.splice(index, 1);

		return this;
	}
};


networkMap.toQueryString = function(object, base){
	var queryString = [];

	networkMap.each(object, function(value, key){
		if (base) key = base + '[' + key + ']';
		var result;
		switch (typeof value){
			case 'object': 
					result = networkMap.toQueryString(value, key); 
			break;
			case 'array':
				var qs = {};
				value.forEach(function(val, i){
					qs[i] = val;
				});
				result = networkMap.toQueryString(qs, key);
			break;
			default: result = key + '=' + encodeURIComponent(value);
		}
		/* jshint ignore:start */
		if (value != null) queryString.push(result);
		/* jshint ignore:end */
	});

	return queryString.join('&');
};
;networkMap.widget = networkMap.widget || {};

networkMap.widget.IntegerInput = function(label, value, options){
	this.options = {
		class: 'nm-input-integer'
	};
	this.setOptions(options);
	this.createElements(label, value);	
};


networkMap.extend(networkMap.widget.IntegerInput, networkMap.Observable);
networkMap.extend(networkMap.widget.IntegerInput, networkMap.Options);
networkMap.extend(networkMap.widget.IntegerInput, {
	createElements: function(label, value){
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add(this.options.class);

		this.label = document.createElement('span');
		this.label.textContent = label;

		this.input = document.createElement('input');
		this.input.setAttribute('type', 'number');
		this.input.setAttribute('value', (value.value) ? value.value : value);
		if (value.inherited) this.input.setAttribute('placeholder', value.inherited);
		this.input.addEventListener('change', function(e){
			this.fireEvent('change', [e, this]);
		}.bind(this));

		if (this.options.min !== undefined){
			this.input.setAttribute('min', this.options.min);	
		}

		if (this.options.disabled === true){
			this.input.disabled = true;
		}

		this.wrapper.appendChild(this.label);
		this.wrapper.appendChild(this.input);

		return this;
	},

	toElement: function(){
		return this.wrapper;
	},

	value: function(){
		return (this.input.value !== '') ? this.input.value : undefined;
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.TextInput = function(label, value, options){
	this.options = {
		class: 'nm-input-text',
		type: 'text'
	};
	this.setOptions(options);

	this.$destroy = [];

	this.createElements(label, value);
};

networkMap.extend(networkMap.widget.TextInput, networkMap.Observable);
networkMap.extend(networkMap.widget.TextInput, networkMap.Options);
networkMap.extend(networkMap.widget.TextInput, {	
	createElements: function(label, value){
		var wrapper = this.wrapper = document.createElement('div');
		wrapper.classList.add(this.options.class);

		var lbl = this.label = document.createElement('span');
		lbl.textContent = label;

		var input = this.input = document.createElement('input');
		var inputHandler = function(e){
			this.fireEvent('change', [e, this]);
		}.bind(this);
		input.setAttribute('type', this.options.type);
		input.setAttribute('value', (value) ? value : '');
		this.$destroy.push({
			el: input,
			type: 'change',
			fn: inputHandler
		});
		input.addEventListener('change', inputHandler, false);

		if (this.options.disabled === true){
			this.input.disabled = true;
		}
		
		wrapper.appendChild(lbl);
		wrapper.appendChild(input);

		return this;
	},
	
	value: function(){
		return (this.input.value !== '') ? this.input.value : undefined;
	},

	toElement: function(){
		return this.wrapper;
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.ColorInput = function(label, value, options){
	this.options = {
		class: 'nm-input-color'
	};

	this.setOptions(options);

	this.createElements(label, value);
};

networkMap.extend(networkMap.widget.ColorInput, networkMap.Observable);
networkMap.extend(networkMap.widget.ColorInput, networkMap.Options);
networkMap.extend(networkMap.widget.ColorInput, {

	createElements: function(label, value){
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add(this.options.class);

		this.label = document.createElement('span');
		this.label.textContent = label;

		this.div = document.createElement('div');

		this.input = document.createElement('input');
		this.input.setAttribute('type', 'color');
		this.input.setAttribute('value', value);
		this.input.addEventListener('change', function(e){
			this.fireEvent('change', [e, this]);
		}.bind(this));
		
		if (this.options.disabled === true){
			this.input.disabled = true;
		}

		this.div.appendChild(this.input);
		this.wrapper.appendChild(this.label);
		this.wrapper.appendChild(this.div);
	},

	/**
	 * Get the current value of the widget
	 * @return {string} The color encoded as a string
	 */
	value: function(){
		return this.input.value;
	},

	toElement: function(){
		return this.wrapper;
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.Accordion = function(options){
	this.options = {
		class: 'nm-accordion'
	};

	this.setOptions(options);

	this.items = [];
	this.wrapper = document.createElement('div');
	this.wrapper.classList.add(this.options.class);
};

networkMap.extend(networkMap.widget.Accordion, networkMap.Observable);
networkMap.extend(networkMap.widget.Accordion, networkMap.Options);
networkMap.extend(networkMap.widget.Accordion, {	
	toElement: function(){
		return this.wrapper;
	},
	add: function(label, options){
		var item = document.createElement('div');
		item.classList.add('nm-accordion-group', 'nm-accordion-open');

		
		var trigger = document.createElement('div');
		trigger.classList.add('nm-accordion-trigger', 'unselectable');
		trigger.textContent = label;

		var list = new networkMap.widget.Accordion.Group(options);
		
		item.appendChild(trigger);
		item.appendChild(list.toElement());

		this.items.push(item);
		this.wrapper.appendChild(item);
		trigger.addEventListener('click', this.clickHandler.bind(this));

		return list;
	},

	clickHandler: function(e){
		e.target.parentNode.classList.toggle('nm-accordion-open');
	}
});

networkMap.widget.Accordion.Group = function(options){
	var list = this.list = document.createElement('ul');
	list.classList.add('nm-accordion-inner');

	if (options && options.id){
		list.setAttribute('id', options.id);		
	}
};

networkMap.extend(networkMap.widget.Accordion.Group, {

	appendChild: function(node){
		if (node.toElement)
			this.list.appendChild(node.toElement());
		else
			this.list.appendChild(node);

		return this;
	},

	toElement: function(){
		return this.list;
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.List = function(options){
	this.options = {
		class: 'nm-list'
	};
	this.listItems = [];
	this.setOptions(options);

	this.list = document.createElement('ul');
	this.list.classList.add(this.options.class);
};

networkMap.extend(networkMap.widget.List, networkMap.Observable);
networkMap.extend(networkMap.widget.List, networkMap.Options);
networkMap.extend(networkMap.widget.List, {
	toElement: function(){
		return this.list;
	},
	add: function(element, options){
		var listItem = new networkMap.widget.ListItem(element, options);
		listItem.addEvent('remove', this.remove.bind(this));
		this.listItems.push(listItem);
		this.list.appendChild(listItem.toElement());
		
		return listItem;
	},
	remove: function(listItem){
		var index = this.listItems.indexOf(listItem);
		this.listItems.splice(index, 1);
				
		return this;
	}
});

networkMap.widget.ListItem = function(element, options){
	this.options = {
		class: 'nm-list-item',
		enableDelete: false
	};
	this.setOptions(options);

	this.listItem = document.createElement('li');
	this.listItem.classList.add(this.options.class);

	if (typeof element === 'string'){
		this.listItem.textContent = element;
	}
	else{
		this.listItem.appechChild(element);
	}

	if (this.options.enableDelete){
		var del = document.createElement('span');
		del.textContent = 'x';
		del.classList.add('nm-list-item-delet', 'pull-right');
		this.$remove = this.remove.bind(this);
		del.addEventListener('click', this.$remove);
	}
};

networkMap.extend(networkMap.widget.ListItem, networkMap.Observable);
networkMap.extend(networkMap.widget.ListItem, networkMap.Options);
networkMap.extend(networkMap.widget.ListItem, {
	remove: function(){
		this.listItem.parentNode.removeChild(this.listItem);
		this.listItem.removeEventListener('click', this.$remove);
		delete this.listItem;
		this.fireEvent('remove', [this]);
		
		return this;
	},
	toElement: function(){
		return this.listItem;
	}
});

;networkMap.widget = networkMap.widget || {};

networkMap.widget.Select = function(label, values, options){
	this.options = {
		class: 'nm-input-select'
	};
	this.setOptions(options);

	this.$destroy = [];

	this.createElements(label);
	this.addOptions(values);
};

networkMap.extend(networkMap.widget.Select, networkMap.Observable);
networkMap.extend(networkMap.widget.Select, networkMap.Options);
networkMap.extend(networkMap.widget.Select, {
	
	createElements: function(label){
		var wrapper = this.wrapper = document.createElement('div');
		wrapper.classList.add(this.options.class);

		var lbl = this.label = document.createElement('span');
		lbl.textContent = label;

		var input = this.input = document.createElement('select');
		var inputHandler = function(e){
			this.fireEvent('select', [e, this]);
		}.bind(this);
		this.$destroy.push({
			el: input,
			type: 'change',
			fn: inputHandler
		});
		input.addEventListener('change', inputHandler, false);

		wrapper.apppendChild(lbl);
		wrapper.apppendChild(input);
	},

	addOptions: function(values){
		values.forEach(function(value){
			this.addOption(value);
		}.bind(this));
	},

	addOption: function(text, options){
		options = options || {};
		
		var el = document.createElement('option');
		el.settAttribute('value', (options.value) ? options.value : text);
		el.textContent = text;
		el.selected = options.selected;

		this.input.apppendChild(el);

		return el;
	},

	value: function(){
		return this.getSelected();
	},

	getSelected: function(){
		return (this.input.selectedIndex !== -1) ? this.input.options[this.input.selectedIndex].value : null; 
	},

	clearOptions: function(){
		while (this.input.firstChild) {
			this.input.removeChild(this.input.firstChild);
		}
		return this;
	},

	toElement: function(){
		return this.wrapper;
	},

	toString: function(){
		return (this.input.selectedIndex !== -1) ? this.input.options[this.input.selectedIndex] : null;
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.Modal = function(options){
	this.options = {
		class: 'modal',
		title: '',
		content: '',
		footer: '',
		type: 'alert'
	};
	this.setOptions(options);
	
	// containing elements to destroy
	this.$destroy = [];

	this.buildUI();	
};

networkMap.extend(networkMap.widget.Modal, networkMap.Observable);
networkMap.extend(networkMap.widget.Modal, networkMap.Options);
networkMap.extend(networkMap.widget.Modal, {
	buildUI: function(){
		

		var modal = this.modal = document.createElement('div');
		modal.classList.add('modal', 'hide', 'fade', 'in');
		modal.style.zIndex = 1000000;

		var header = this.header = document.createElement('div');
		header.classList.add('modal-header');

		var closeButton = this.closeButton = document.createElement('button');
		var closeHandler = this._close.bind(this);
		closeButton.classList.add('close');
		closeButton.innerHTML = '&times;';
		this.$destroy.push({
			el: closeButton,
			type: 'click',
			fn: closeHandler
		});
		closeButton.addEventListener('click', closeHandler, false);
		header.appendChild(closeButton);

		var title = this.title = document.createElement('h3');
		title.innerHTML = this.options.title;
		header.appendChild(title);

		var body = this.body = document.createElement('div');
		body.classList.add('modal-body');
		body.innerHTML = this.options.content;

		var footer = this.footer = document.createElement('div');
		footer.classList.add('modal-footer');
		footer.innerHTML = this.options.footer;

		modal.appendChild(header);
		modal.appendChild(body);
		modal.appendChild(footer);
		
		return this;
	},
	alert: function(html, options){
		options = options || {};
		
		this.body.innerHTML =  html;
		this.title.innerHTML = (options.title) ? options.title : 'Alert';		
		
		
		var btn = this.btn = document.createElement('a');
		var btnHandler = this.destroy.bind(this);
		btn.setAttribute('href', '#');
		btn.classList.add('btn');
		btn.textContent = (options.button) ? options.button : 'Ok';
		this.$destroy.push({
			el: btn,
			type: 'click',
			fn: btnHandler
		});
		btn.addEventListener('click', btnHandler, false);
		this.footer.appendChild(btn);

		document.body.appendChild(this.modal);
	
		return this.show();				
	},
	confirm: function(html, options){
		options = options || {};
		
		this.body.innerHTML = html;
		this.title.innerHTML = (options.title) ? options.title : 'Alert';		
		
		var cancelBtn = document.createElement('a');
		var cancelHandler = this._cancel.bind(this);
		cancelBtn.setAttribute('href', '#');
		cancelBtn.classList.add('btn');
		cancelBtn.textContent = (options.button) ? options.button : 'Ok';
		this.$destroy.push({
			el: cancelBtn,
			type: 'click',
			fn: cancelHandler
		});
		cancelBtn.addEventListener('click', cancelHandler, false);
		this.footer.appendChild(cancelBtn);

		var okBtn = document.createElement('a');
		var okHandler = this._cancel.bind(this);
		okBtn.setAttribute('href', '#');
		okBtn.classList.add('btn');
		okBtn.textContent = (options.button) ? options.button : 'Ok';
		this.$destroy.push({
			el: okBtn,
			type: 'click',
			fn: okHandler
		});
		okBtn.addEventListener('click', okHandler, false);
		this.footer.appendChild(okBtn);

		document.body.appendChild(this.modal);
	
		return this.show();				
	},
	show: function(){
		this.modal.style.display = 'block';
		return this;
	},
	destroy: function(){
		this.modal.parentNode.removeChild(this.modal);

		this.$destroy.forEach(function(ref){
			ref.el.removeEventListener(ref.type, ref.fn, false);
		});
		this.$destroy.length = 0;
		return this;
	},
	
	_close: function(e){
		this.fireEvent('close', [e]);
		this.destroy();
	},
	_ok: function(e){
		this.fireEvent('ok', [e]);
		this.destroy();
	},
	_cancel: function(e){
		this.fireEvent('cancel', [e]);
		this.destroy();
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.Checkbox = function(label, value, options){
	this.options = {
		class: 'nm-checkbox',
		type: 'checkbox'
	};

	this.setOptions(options);
	this.createElements(label, value);
};

networkMap.extend(networkMap.widget.Checkbox, networkMap.Observable);
networkMap.extend(networkMap.widget.Checkbox, networkMap.Options);
networkMap.extend(networkMap.widget.Checkbox, {

	createElements: function(label, value){
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add(this.options.class);

		this.label = document.createElement('span');
		this.label.textContent = label;

		this.input = document.createElement('input');
		this.input.setAttribute('type', this.options.type);
		this.input.checked = value;
		this.input.addEventListener('change', function(e){
			this.fireEvent('change', [e, this]);
		}.bind(this));


		if (this.options.disabled === true){
			this.input.disabled = true;
		}
		
		this.wrapper.appendChild(this.label);
		this.wrapper.appendChild(this.input);

		return this;
	},
	
	toElement: function(){
		return this.wrapper;
	},

	value: function(){
		return this.input.value;
	},
	
	isChecked: function(){
		return this.input.checked;
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.GridInput = function(label, value, options){
	this.options = {
		class: 'nm-input-snap',
		type: 'snap'
	};
	
	this.setOptions(options);
	this.createElements(label, value);
};

networkMap.extend(networkMap.widget.GridInput, networkMap.Observable);
networkMap.extend(networkMap.widget.GridInput, networkMap.Options);
networkMap.extend(networkMap.widget.GridInput, {
	createElements: function(label, value){
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add(this.options.class);

		this.label = document.createElement('span');
		this.label.textContent = label;

		this.check = document.createElement('input');
		this.check.setAttribute('type', 'checkbox');
		this.check.checked = value.enabled;
		this.check.addEventListener('change', function(e){
			this.x.input.disabled = !this.check.checked;
			this.y.input.disabled = !this.check.checked;
			e.value = this.value();
			this.fireEvent('change', [e]);
		}.bind(this));

		this.x = this.$createInputs('x', value.grid.x, value.enabled);
		this.y = this.$createInputs('y', value.grid.y, value.enabled);

		this.wrapper.appendChild(this.label);
		this.wrapper.appendChild(this.check);
		this.wrapper.appendChild(this.x.label);
		this.wrapper.appendChild(this.x.input);
		this.wrapper.appendChild(this.y.label);
		this.wrapper.appendChild(this.y.input);
	},

	$createInputs: function(label, value, enabled){
		var els = {};
		els.label = document.createElement('span');
		els.label.textContent = label;

		els.input = document.createElement('input');
		els.input.setAttribute('type', 'number');
		els.input.setAttribute('value', (value) ? value : 1);
		els.input.setAttribute('min', 1);
		els.input.setAttribute('max', 50);
		els.input.disabled = !enabled;
		els.input.addEventListener('change', function(e){
			e.value = this.value();
			this.fireEvent('change', [e, this]);
		}.bind(this));
		return els;
	},

	value: function(){
		return {
			enabled: this.check.checked,
			grid: {
				x: parseInt(this.x.input.value, 10),
				y: parseInt(this.y.input.value, 10)
			}
		};
	},

	toElement: function(){
		return this.wrapper;
	}
});;networkMap.Properties = function(properties, defaults){
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
;networkMap.datasource = networkMap.datasource || {};

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
});;networkMap.events = networkMap.events || {
	click: function(e, link){
		if (link.options.events.click.href){
			window.location.href = link.options.events.click.href;
		}
	},
	
	hover: function(e, link, el){
		el.set('text', link.options.name);
	},
	mouseover: function(e, options, hover){},
	
	mouseout: function(e, options, hover){}
};

networkMap.registerEvent = function(name, f){
	if (!networkMap.events[name])
		throw "Invalid event: " + name + " is not an registered event";
	
	if (name === 'click'){
		networkMap.events[name] = function(e, link){
			//var options = (e.target.instance.link) ? e.target.instance.link.click : e.target.instance.parent.link.click;
			f(e, link);
		};
	}
	else if (name === 'hover'){	
		networkMap.events.mouseover = function(e, link){
			var el = document.getElementById('nm-active-hover');
			var id = e.target.instance.attr('id');
			
			if (el){
				if (el && el.retrieve('id') !== e.target.instance.attr('id')){
					el.destroy();	
				}
				else{
					el.store('keep', true);
					return;
				}	
			}
			
			/*
			var position = e.target.getPosition(),
			svg = e.target.instance;
				
			var midX, midY;
			var viewbox = svg.doc().viewbox();
			if (svg.getSegment(6).type !== 'Z'){
				var segment11 = svg.getSegment(2),
				segment12 = svg.getSegment(3),
				segment21 = svg.getSegment(5),
				segment22 = svg.getSegment(6);
				
				midX = ((segment11.coords[0] + segment22.coords[0])/2 +
					(segment12.coords[0] + segment21.coords[0])/2)/2;
	
				midY = ((segment11.coords[1] + segment22.coords[1])/2 +
					(segment12.coords[1] + segment21.coords[1])/2)/2;
			}
			else{
				var s1 = svg.getSegment(1),
				s2 = svg.getSegment(2),
				s4 = svg.getSegment(4),
				s5 = svg.getSegment(5);
				
				midX = ((s1.coords[0] + s2.coords[0] + s4.coords[0] + s5.coords[0]) / 4 + viewbox.x ) * viewbox.zoomX;
	
				midY = ((s1.coords[1] + s2.coords[1] + s4.coords[1] + s5.coords[1]) / 4  + viewbox.y ) * viewbox.zoomY;
				
				console.log(s1.coords[0] , s2.coords[0] , s4.coords[0] , s5.coords[0]);
			}

			*/
			
			
			el = new Element('div', {
				'id': 'nm-active-hover',
				'class': 'nm-hover',
				events: {
					mouseover: function(){
						el.store('mouseover', true);
					},
					mouseout: function(){
						el.eliminate('mouseover');
						(function(){
							if (!el.retrieve('keep'))
								el.destroy();
							else
								el.eliminate('keep');
						}).delay(10);
					},
					click: function(ev){
						link._clickHandler(e);
					}
						
					
				}
			})
			.store('id', e.target.instance.attr('id'));
			
			el.setStyles({
				top: -1000,
				left: -1000	
			});
					
			
			document.id(document.body).grab(el);
						
			f(e, link, el);
			
			var size = el.getSize();
			var bboxClient = e.target.getBoundingClientRect();
			
			el.setStyles({
				top: (bboxClient.top + bboxClient.bottom)/2 - size.y/2,
				left: (bboxClient.left + bboxClient.right)/2 - size.x/2
			});
		
		};
		
		networkMap.events.mouseout = function(e, link){
			var options = e.target.instance.link;
			(function(){
				var el = document.id('nm-active-hover');
				if (el && el.retrieve('id') !== e.target.instance.attr('id')){
					return;	
				}

				if (el && !el.retrieve('mouseover')){
					el.destroy();
				}
			}).delay(10);
		};
	}
	else{
		networkMap.events[name] = f;	
	}
};

networkMap.registerEvent('click', networkMap.events.click);
networkMap.registerEvent('mouseover', networkMap.events.mouseover);
networkMap.registerEvent('mouseout', networkMap.events.mouseout);
networkMap.registerEvent('hover', networkMap.events.hover);;
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
			return '#000';

		
		var hue = 220 - (Math.floor(value * 24) * 10);
		if (hue < 0) {
			hue = 360 - hue;
		}
		return "hsl(" + hue + ", 100%, 50%)";
	},
	map: [
		'#000',
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
		0, //#000
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
};;/**
 * Creates an instance of networkMap.ColorLegend.
 *
 * @constructor
 * @this {networkMap.ColorLegend}
 * @param {string} The name of the colormap
 * @param {Object} A options object.
 */
networkMap.ColorLegend = function(colormap, options){
	this.options = {
		/** The size of the the color square */
		boxSize: 25,
		/** margin */
		margin: 10,
		/** target */
		target: null
	};
	this.graph = options.graph;
	delete options.graph;

	this.setOptions(options);
	this.colormap = networkMap.colormap[colormap];

	if (!this.colormap){
		throw 'Colormap "' + colormap + '" is not registerd';
	}

	this.draw();
	
	// Fix for FF 
	// A timing issue seems to cause the bbox to
	// return an incorrect value
	setTimeout(function(){
		var bbox = this.svg.bbox();
		if (bbox.x === 0 && bbox.y === 0){
			return this;
		}
		this._move();
	}.bind(this), 0);
};

networkMap.extend(networkMap.ColorLegend, networkMap.Options);

networkMap.extend(networkMap.ColorLegend, {

	

	/** The graph object to attach to */
	graph: null,

	/**
	 * Draw/redraw the legend in the graph
	 *
	 * @this {networkMap.ColorLegend}
	 * @return {networkMap.ColorLegend} self
	 */
	draw: function(){
		var colormap = this.colormap.map;

		var container = this.container = this.wrapper = document.createElement('div');
		this.wrapper.classList.add('nm-colormap');
		this.options.target.appendChild(container);

		var svg = this.svg = this.svg || SVG(container).group();
		this.svg.clear();	

		

		colormap.forEach(function(color, index){
			svg.rect(this.options.boxSize, this.options.boxSize).attr({
				fill: color,
				'stroke-width': 1
			}).move(
				0, 
				(colormap.length - 1 - index) * this.options.boxSize
			);

			svg.line(
				-5, (colormap.length - 1 - index) * this.options.boxSize,
				0, (colormap.length - 1 - index) * this.options.boxSize
			).attr({
				stroke:'#000'

			});

			svg.text(Math.round(this.colormap.limits[index].toString() * 100) + '%')
				.attr({
					'text-anchor': 'end',
					'font-size': this.options.boxSize/2
				})
				.move(
				-this.options.boxSize/2,
				(colormap.length - 1.3 - index) * this.options.boxSize ,
				'end'
			);
		}.bind(this));

		svg.line(
			-5, (colormap.length) * this.options.boxSize,
			0, (colormap.length) * this.options.boxSize
		).attr({
			stroke:'#000'

		});

		svg.text('0%')
			.attr({
				'text-anchor': 'end',
				'font-size': this.options.boxSize/2
			})
			.move(
			-this.options.boxSize/2, 
			(colormap.length - 0.3) * this.options.boxSize ,
			'end'
		);
		
		this._move();

		return this;
	},

	/**
	 * Move the legend and resize the containing div
	 *
	 * @this {networkMap.ColorLegend}
	 * @return {networkMap.ColorLegend} self
	 */
	_move: function(){
		var bbox = this.svg.bbox();
		
		this.container.style.width = Math.ceil(bbox.width) + 'px';
		this.container.style.height = Math.ceil(bbox.height) + 'px';
		
		this.svg.move(Math.abs(bbox.x), Math.abs(bbox.y));

		return this;
	}

});
;/**
 * Creates an instance of networkMap.SettingsManager.
 *
 * @constructor
 * @this {networkMap.SettingsManager}
 * @param {Element} The html element to inject into
 * @param {networkMap.Mediator} An instance of networkMap.Mediator
 */
networkMap.SettingsManager = function(container, mediator){
	this.container = container;
	this.mediator = mediator;
	this.editing = false;
	this.nav = this.createMenu();
	container.appendChild(this.nav);

	if (this.mediator){
		this.mediator.subscribe('edit', this.edit.bind(this));
	}
};

networkMap.extend(networkMap.SettingsManager, networkMap.Observable);

networkMap.extend(networkMap.SettingsManager, {
	
	/**
	 * Create the HTML for the settings manager
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {Element} The HTML for the settingsmanager.
	 */
	createMenu: function(){
		var nav = document.createElement('nav');
		nav.classList.add('nm-menu');

		var trigger = document.createElement('div');
		trigger.classList.add('nm-trigger');
		trigger.innerHTML = '<span class="nm-icon nm-icon-menu"></span><a class="nm-label">Settings</a>';
		trigger.addEventListener('click', this.toggle.bind(this));

		var menu = this.menu = document.createElement('ul');

		var editContent = document.createElement('ul');
		editContent.classList.add('nm-object-properties');
		editContent.setAttribute('id', 'nm-edit-content');

		menu.appendChild(editContent);

		var menuButtons = this.menuButtons = document.createElement('li');
		menuButtons.classList.add('clearfix', 'nm-menu-buttons');

		var saveButton = this.btnSave = document.createElement('button');
		saveButton.textContent = 'Save';
		saveButton.classList.add('btn', 'btn-primary', 'pull-right');
		saveButton.addEventListener('click', this.save.bind(this));

		menu.appendChild(menuButtons);
		menuButtons.appendChild(saveButton);
		nav.appendChild(trigger);
		nav.appendChild(menu);

		return nav;
	},

	/**
	 * Returns the content container. This container is
	 * used when custom html should be injected.
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {Element} The content conainer
	 */
	getContentContainer: function(){
		return this.nav.querySelector('#nm-edit-content');
		//return this.nav.getElement('#nm-edit-content');
	},

	/**
	 * By calling this function and sending in the 
	 * object that shold be edited the settingsManager
	 * will setup the UI. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	edit: function(configWidget){
		this.editing = configWidget;
		var editables;
		var link = {};		
		
			
		var content = this.getContentContainer();
		this.clear();
		this.displayButtons();
		
		// This is for other types of nodes.
		// TODO: Clean up when all is using the mediator
		if (configWidget.toElement)
			content.appendChild(configWidget.toElement());
		else
			content.appendChild(configWidget.getSettingsWidget().toElement());

		// TODO: Remove when all are using the mediator
		this.fireEvent('edit', [configWidget]);
		
		return this;
	},

	/**
	 * Clears the content container.
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	clear: function(){
		var container = this.getContentContainer();
		while (container.firstChild){
			container.removeChild(container.firstChild);
		}

		return this;
	},
	
	/**
	 * Hides the normal menu buttons. The callback
	 * will be called before they are set into visable
	 * state. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	hideButtons: function(callback){
		
		this.menuButtons.setStyle('display', 'none');
		this.showButtonsCallback = (callback) ? callback : function(){};
		
		return this;	
	},

	/**
	 * Hides the normal menu buttons. The callback
	 * will be called before they are set into visable
	 * state. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	displayButtons: function(){
		if (!this.showButtonsCallback){
			return this;
		}
			
		this.showButtonsCallback();
		delete this.showButtonsCallback;
		
		this.menuButtons.style.display = 'block';
		
		return this;
	},

	defaultView: function(){
		this.clear();
		this.fireEvent('defaultView', [this]);	
	},

	/**
	 * Toggle the settings manager. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	toggle: function(){
		if (this.nav.classList.contains('nm-menu-open')){
			return this.disable();
		}
		else {
			return this.enable();
		}
	},
	

	/**
	 * Enable the settings manager. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	enable: function(){
		this.nav.classList.add('nm-menu-open');	
		this.fireEvent('active');
		this.fireEvent('defaultView', [this]);

		return this;
	},
	

	/**
	 * Disable the settings manager. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	disable: function(){
		this.nav.classList.remove('nm-menu-open');
		var content = this.nav.querySelector('#nm-edit-content');
		while (content.firstChild) {
			content.removeChild(content.firstChild);
		}
		this.fireEvent('deactive');

		return this;
	},
	

	/**
	 * This triggers a save event.
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	save: function(){
		this.fireEvent('save');

		return this;
	}

});
;/**
 * Creates an instance of networkMap.Graph.
 *
 * @constructor
 * @this {networkMap.Graph}
 * @param {string|element} A string or Element to attach to network graph to
 * @param {Object} A options object.
 */
networkMap.Graph = function(target, options){
	/** The default options*/
	this.options = {
		/** The with of the graph */
		width: 10,
		
		/** The height of the graph */
		height: 10,
		
		/** The name of the datasoruce to use */
		datasource: undefined,
		
		/** The name of the colormap to use */
		colormap: undefined,
		
		/** Controls of the settings manager is created */
		enableEditor: true,
		
		/** Controls if the nodes are draggable */
		allowDraggableNodes: undefined,
		
		/** Controlls how often the links refresh the data */
		refreshInterval: 300,
		
		/** Controls if the link update should be controlled 
		 * by the graph or the link */ 
		batchUpdate: true,

		/** Controls if the grid is enabled */
		gridEnabled: true,		
		
		/** A grid size for objects to snap to */
		grid: {x:10, y:10},
		
		node: {
			linkGenerator: null
		},
		link: {
			linkGenerator: null
		}
	};
	/** The default configuration */
	this.defaults = {};
	

	/** This array controls what is exported in getConfiguration*/
	this.exportedOptions = [
		//'width',
		//'height'
	];

	/** An internal array of nodes, do not use directly */
	this.nodes = [];

	/** An internal array of links, do not use directly */
	this.links = [];

	/** An internal reference to onSave configuration */
	this.saveData = {};

	/** An internal reference to check keep track of the mode */
	this._mode = 'normal';

	this.options = networkMap.defaults(options, this.options);

	if (this.options.node.linkGenerator){
		this.options.node.linkGenerator = networkMap.Node.createLinkGenerator(this.options.node.linkGenerator);
	} else{
		this.options.node.linkGenerator = networkMap.Node._linkGenerator;		
	}
	
	if (this.options.link.linkGenerator){
		this.options.link.linkGenerator = networkMap.Link.createLinkGenerator(this.options.link.linkGenerator);
	} else{
		this.options.link.linkGenerator = networkMap.Link._linkGenerator;		
	}
	
	this.defaults.node = new networkMap.Properties({}, networkMap.Node.defaults);
	this.defaults.link = new networkMap.Properties({}, networkMap.Link.defaults);
	this.defaults.link.set('colormap', this.options.colormap);
	this.defaults.link.set('datasource', this.options.datasource);

	this.element = (typeof target == 'string' || target instanceof String) ? document.getElementById(target) : target;
	this.container = document.createElement('div');
	this.container.classList.add('nm-container');
	this.element.appendChild(this.container);

	this.svg = SVG(this.container);
	this.graph = this.svg.group();
	
	this.legend = new networkMap.ColorLegend(this.defaults.link.get('colormap'), {graph: this, target: this.container});

	if (this.options.enableEditor){
		this.settings = new networkMap.SettingsManager(this.container, this);
		this.settings.addEvent('defaultView', function(){
			this.settings.edit(this);
		}.bind(this));
		this.settings.addEvent('active', this.enableEditor.bind(this));
		this.settings.addEvent('deactive', this.disableEditor.bind(this));
		this.settings.addEvent('save', this.save.bind(this));
	}
		
	this.addEvent('resize', this.rescale.bind(this));
	
	this.setRefreshInterval(this.options.refreshInterval);
	
	this.svg.on('click', this._clickHandler.bind(this));
	
	this.addEvent('load', this.update.bind(this));
};

networkMap.extend(networkMap.Graph, networkMap.Observable);
networkMap.extend(networkMap.Graph, networkMap.Mediator);
networkMap.extend(networkMap.Graph, networkMap.Options);

networkMap.extend(networkMap.Graph, {
	
	/**
	 * Set the default options for the graph. The defaults will be 
	 * merged with the current defaults.
	 * 
	 * @param element {string} The element to set default options for.
	 * Can be one of (node|link)
	 * @param defaults {object} An object with key value pairs of options
	 * @return {networkMap.Graph} self
	 */
	setDefaults: function(element, properties){
		if (!this.defaults[element]){
			throw "Illigal element";
		}
		
		this.defaults[element].load(properties);
		
		// TODO: rework
		this.fireEvent('redraw', [{defaultsUpdated: true}]);
		
		return this;
	},

	/**
	 * Retrive the default configuration for a graph element
	 *
	 * @param element {string} The graph element to return defaults for.
	 * @return {object} the default configuration 
	 */
	getDefaults: function(element){
		if (!this.defaults[element]){
			throw "Illigal element";
		}
		
		return this.defaults[element];
	},

	/** 
	 * Set the intervall which the graph should refresh
	 *
	 * @param interval {int} interval in seconds. If null it 
	 * will disable the updates.  
	 * @return {networkMap.Graph} self
	 */
	setRefreshInterval: function(interval){
		this.options.interval = interval;
		
		if (interval){
			this.intervalId = setInterval(function(){
				this.update();
			}.bind(this), interval*1000);
		}
		else if (this.intervalId){
			clearInterval(this.intervalId);
			delete this.intervalId;
		}
		
		return this;
	},

	/**
	 * Trigger an event in an object
	 * @param event {string} The event name to trigger 
	 * @param object {object} The object to trigger the event on
	 * 
	 * @return {networkMap.Graph} self
	 */
	triggerEvent: function(event, object){
		object.fireEvent(event, object);

		return this;
	},

	/**
	 * This will rescale the SVG element, and if it 
	 * does not fit it will will zoom out.
	 *
	 * @ retrun {networkMap.Graph} self
	 */
	rescale: function(){
		var docSize = {
			x: this.element.offsetWidth,
			y: this.element.offsetHeight
		};	
		
		this.svg.size(
			docSize.x, 
			docSize.y
		);
					
		var bbox = this.graph.bbox();	
			
		// scale the svg if the docsize is to small
		if (docSize.x < (bbox.width + Math.abs(bbox.x)) || docSize.y < (bbox.height + Math.abs(bbox.y))){
			this.svg.viewbox(bbox.x, bbox.y, bbox.width + Math.abs(bbox.x), bbox.height + Math.abs(bbox.y));
		}
		else{
			this.svg.viewbox(
				(bbox.x < 0) ? bbox.x : 0,
				(bbox.y < 0) ? bbox.y : 0, 
				docSize.x,
				docSize.y
			);
		}
		
		return this;		
	},

	/**
	 * Returns the root SVG object
	 *
	 * @ retrun {SVG}
	 */
	getSVG: function(){
		return this.svg;
	},

	/**
	 * Returns the main SVG group used for painting the graph
	 *
	 * @ retrun {SVG.Group}
	 */
	getPaintArea: function(){
		return this.graph;
	},

	/**
	 * Returns the settingsManager that is bound to the graph
	 *
	 * @ retrun {networkMap.SettingsManager}
	 */
	settingsManager: function(){
		return this.settings();
	},

	/**
	 * Generates HTML that is used for configuration
	 *
	 * @this {networkMap.Graph}
	 * @return {Element} A HTML Element that contains the UI
	 */
	getSettingsWidget: function(){
		var container = new networkMap.widget.Accordion();
		var accordionGroup;

		var changeHandler = function(defaults, key){
			return function(e, widget){
				defaults.set(key, widget.value());
				//defaults[key] = e.target.value;
				//this.fireEvent('redraw', [{defaultsUpdated: true}]);
			}.bind(this);
		}.bind(this);
	
		accordionGroup = container.add('Globals');
		accordionGroup.appendChild(new networkMap.widget.GridInput('Grid', {
			enabled: this.options.gridEnabled,
			grid: this.options.grid
		}).addEvent('change', function(e){
			if (e.value.enabled)
				this.grid(e.value.grid);
			else
				this.grid(false);
		}.bind(this)));
				
	
		accordionGroup = container.add('Node Defaults');		
		networkMap.each(networkMap.Node.defaultTemplate, function(option, key){
			if (option.type === 'number'){
				accordionGroup.appendChild(
					new networkMap.widget.IntegerInput(option.label, this.defaults.node.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.node, key)
					)
				);
			}
			else if(option.type === 'text'){
				accordionGroup.appendChild(
					new networkMap.widget.TextInput(option.label, this.defaults.node.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.node, key)
					)
				);
			}
			else if (option.type === 'color'){
				accordionGroup.appendChild(
					new networkMap.widget.ColorInput(option.label, this.defaults.node.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.node, key)
					)
				);
			}
		}.bind(this));
		
		accordionGroup = container.add('Link Defaults');		
		networkMap.each(networkMap.Link.defaultTemplate, function(option, key){
			if (option.type === 'number'){
				accordionGroup.appendChild(
					new networkMap.widget.IntegerInput(option.label, this.defaults.link.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.link, key)
					)
				);
			}
			else if(option.type === 'text'){
				accordionGroup.appendChild(
					new networkMap.widget.TextInput(option.label, this.defaults.link.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.link, key)
					)
				);
			}
			else if (option.type === 'color'){
				accordionGroup.appendChild(
					new networkMap.widget.ColorInput(option.label, this.defaults.link.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.link, key)
					)
				);
			}
		}.bind(this));
				
		
		return container;
	},

	grid: function(grid){
		if (grid === true){
			this.options.gridEnabled = true;
			
			return this;
		}
		
		if (grid === false){
			this.options.gridEnabled = false;	
		}		
		
		if (grid === undefined){
			if (!this.options.gridEnabled)
				return false;
				
			return this.options.grid;
		}
		
		if (typeof grid === 'object'){
			this.options.gridEnabled = true;			
			this.options.grid = grid;
		}

		this.disableDraggableNodes();
		this.enableDraggableNodes();
		return this;
	},

	/**
	 * Load a network map, it can either be a URI string
	 * or an configuration object.
	 *
	 * @param {string|object} The thing to load
	 * @retrun {networkMap.Graph} self
	 * @throws "TypeError"
	 */
	load: function(obj){
		if (typeof obj == 'string' || obj instanceof String){
			return this.loadUrl(obj);
		}
		else if (obj !== null && typeof obj === 'object'){
			return this.loadObject(obj);
		}
		else{
			throw new TypeError('Unknown type ' + Object.prototype.toString.call(obj));
		}
		return this;
	},

	/**
	 * Loads a JSON file from the URL and builds a 
	 * network map.
	 *
	 * @param {string} The URL to the JSON file
	 * @ retrun {networkMap.Graph} self
	 */
	loadUrl: function(url){
		var request = new XMLHttpRequest();
		request.open('GET', url, true);

		request.onload = function() {
			if (request.status >= 200 && request.status < 400){
				// Success!
				this.loadObject(JSON.parse(request.responseText));
			} else {
				new networkMap.widget.Modal().alert('There was an error when loading the weathermap (' + request.status + ')', {title: 'Error'});
			}
		}.bind(this);

		request.onerror = function() {
			new networkMap.widget.Modal().alert('An error occurred when trying to load the resource', {title: 'Error'});
		};

		request.send();

		return this;
	},

	/**
	 * Load an object representation of a network map.
	 *
	 * @param {Object} The Object representation of the mao
	 * @ retrun {networkMap.Graph} self
	 */
	loadObject: function(mapStruct){
		this.setOnSave(mapStruct.onSave);
		
		if (mapStruct.defaults){
			this.setDefaults('node', mapStruct.defaults.node || {});
				//this.defaults.node);
			this.setDefaults('link', mapStruct.defaults.link || {});
				//this.defaults.link);
		}
		
		mapStruct.nodes.forEach(function(node){
			node.graph = this;
			node.draggable = this.options.allowDraggableNodes;
			
			this.addNode(new networkMap.Node(node), false);
		}.bind(this));

		mapStruct.links.forEach(function(link){
			link.graph = this;
			this.addLink(new networkMap.Link(link), false);
		}.bind(this));
		
		this.fireEvent('load', [this]);
		this.triggerEvent('resize', this);

		return this;
	},

	/**
	 * This will set the configuration that controlls
	 * the save call. See documentation for onSave in
	 * the configuration file documentation for more 
	 * information.
	 *
	 * @param {Object} The onŚave configuration
	 * @ retrun {networkMap.Graph} self
	 */
	setOnSave: function(saveData){
		if (saveData){
			if (this.validateSave(saveData))
				this.saveData = saveData;
		}
		return this;
	},

	/**
	 * Retreive the configuration object for the save
	 * call. See documentation for onSave in the 
	 * configuration file documentation for more 
	 * information.
	 *
	 *
	 * @ retrun {Object} The onSave configuration.
	 */
	getOnSave: function(){
		return (this.saveData) ? this.saveData : {};
	},

	
	/**
	 * Validate a onSave configuration object. Returns
	 * true if it validates, false otherwise.
	 * structure:
	 * "onSave": {
	 *  "method": "post|get",
	 *  "url": "update.php",
	 *  "data": {
	 *   "id": "weathermap.json"		
	 *  }
	 * }
	 *
	 * @ retrun {boolean} The onSave configuration.
	 */
	validateSave: function(save){
		if (save.method && !(save.method == 'post' || save.method == 'get')){
			this.saveEnabled = false;
			alert("Illigal argument: " + save.method + ". Valid onSave.method arguments are: post, get"); 
			return false;
		}
		else{
			save.method = "post";	
		}
				
		save.data = save.data || {};
		
		if (!save.url){
			this.saveEnabled = false;
			alert("Missing argument onSave.url");	
			return false;
		}
		
		return true;		
	},

	/**
	 * Send a save request to the server.
	 *
	 * @ retrun {boolean} If request could be sent
	 * @todo Emit event when save is compleated
	 */
	save: function(){
		if (!this.saveData)
			return false;
			
		var data = this.getConfiguration();

		var html = this.settings.btnSave.innerHTML;
		this.settings.btnSave.textContent = '.....';

		var params = networkMap.toQueryString(data);		 
		var request = new XMLHttpRequest();

		request.open(this.saveData.method, this.saveData.url, true);
		request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		request.onload = function() {
			this.settings.btnSave.innerHTML = html;
			if (request.status >= 200 && request.status < 400){
				data = JSON.parse(request.responseText);
				if (data.status === 'ok'){
					new networkMap.widget.Modal().alert('Weathermap saved');
				}
				if (data.status === 'nok'){
					new networkMap.widget.Modal().alert(data.error, {title: 'Error'});
				}
				if (data.status == 'deleted'){
					new networkMap.widget.Modal().alert('The networkmap is deleted', {title: 'Error'});
				}
			} else {
				new networkMap.widget.Modal()
					.alert('There was an error while saving the weathermap (' + request.status + ')', {title: 'Error'});
			}
		}.bind(this);

		request.onerror = function() {
			this.settings.btnSave.innerHTML = html;
			new networkMap.widget.Modal()
				.alert('There was an error while saving the weathermap', {title: 'Error'});
		};

		request.send(params);
	
		return true;
	},


	/**
	 * Set nodes and links in edit mode
	 *
	 * @ retrun {networkManager.Graph} self
	 */
	enableEditor: function(){
		this.enableDraggableNodes();
		this.nodes.forEach(function(node){
			node.mode('edit');
		});

		this.links.forEach(function(link){
			link.mode('edit');
		});
		
		this._mode = 'edit';

		return this;
	},

	/**
	 * Disable edit mode on nodes and links.
	 *
	 */
	disableEditor: function(){
		this.disableDraggableNodes();
		
		this.nodes.forEach(function(node){
			node.mode('normal');
		});
		this.links.forEach(function(link){
			link.mode('normal');
		});

		this._mode = 'normal';

		return this;
	},
	
	_clickHandler: function(e){
		if (this._mode !== 'edit'){
			return;
		}
		
		if (e.target.instance === this.svg || e.target.instance === this.graph){
			this.settings.edit(this);
		}
	},

	/**
	 * Enable draggable nodes
	 *
	 * @ retrun {networkMap.Graph} self
	 */
	enableDraggableNodes: function(){
		this.nodes.forEach(function(node){
			node.draggable();
		});

		return this;		
	},

	/**
	 * disable draggable nodes
	 *
	 * @ retrun {networkMap.Graph} self
	 */
	disableDraggableNodes: function(){
		this.nodes.forEach(function(node){
			node.fixed();	
		});

		return this;
	},

	/**
	 * Fetch configuration from links and nodes
	 *
	 * @ retrun {Object} A networkmap configuration object
	 */
	getConfiguration: function(){
		var configuration = {
			defaults: {
				node: this.defaults.node.extract(),
				link: this.defaults.link.extract()
			},
			nodes: [],
			links: [],
			onSave: this.saveData
		};

		// self
		this.exportedOptions.forEach(function(option){
			configuration[option] = this.options[option];
		}.bind(this));
		configuration.onSave = this.saveData;

		// nodes
		this.nodes.forEach(function(node){
			configuration.nodes.push(node.getConfiguration());
		});

		// links
		this.links.forEach(function(link){
			configuration.links.push(link.getConfiguration());
		});

		return configuration;
	},

	registerLinkGenerator: function(component, f){
		this._linkGenerator[component] = f;
	},

	/**
	 * Add a node to the graph
	 *
	 * @param {networkMap.Node} The node to add
	 * @param {Boolean ? true } If set to false the resize event will not be triggered
	 * @ retrun {networkMap.Graph} self
	 * @todo refactor to a factory method
	 */
	addNode: function(node, refresh){
		this.nodes.push(node);

		// listen to the requestHref to provide node href
		node.addEvent('requestHref', this.options.node.linkGenerator);
		
		// as the node is already created we need to trigger an update of the link
		node.updateLink();

		if (refresh !== false){
			this.triggerEvent('resize', this);	
		}

		return this;
	},

	/**
	 * Get the node with ID = id, returns undefined 
	 * if the node does not exist.
	 *
	 * @param {string} A node id
	 * @ retrun {networkMap.Node} The node or undefined
	 */
	getNode: function(id){
		return networkMap.find(this.nodes, function(node){	
			if (node.options.id === id){
				return true;
			}
		});
	},
	
	/**
	 * Remove a node from the graph
	 *
	 * @param {networkMap.Node} The node to remove
	 * @ retrun {networkMap.Graph} self
	 * @todo refactor so the node is removed by unseting 
	 * the graph reference in the node.
	 */
	removeNode: function(node){
		this.nodes.erase(node);
		node.setGraph(null);

		this.getLinks(node).forEach(function(link){
			this.removeLink(link);
		}.bind(this));		
		
		return this;
	},

	/**
	 * Add a link to the graph
	 *
	 * @param {networkMap.Link} The link to add
	 * @param {Boolean ? true} If set to false the resize event will not be triggered
	 * @ retrun {networkMap.Graph} self
	 * @todo this should happen when the setting 
	 *	the graph in the link.
	 */
	addLink: function(link, refresh){
		this.links.push(link);

		// listen to the requestHref to provide link href
		link.addEvent('requestHref', this.options.link.linkGenerator);
		
		// as the link is already created we need to trigger an update of the link
		link.updateLink();


		if (refresh !== false){
			this.triggerEvent('resize', this);	
		}


		return this;
	},	
	

	getLink: function(nodeIdA, nodeIdB){
		return networkMap.find(this.links, function(link){
			if (link.nodeA.options.id === nodeIdA && link.nodeB.options.id === nodeIdB){
				return true;
			}
			if (link.nodeA.options.id === nodeIdB && link.nodeB.options.id === nodeIdA){
				return true;
			}

		});
	},

	getLinks: function(node, secondaryNode){
		var links = [];		
		
		this.links.forEach(function(link){
			if (link.connectedTo(node, secondaryNode)){
				links.push(link);
			}
		});
		
		return links;
	},

	/**
	 * Remove a link from the graph
	 *
	 * @param {networkMap.Link} The link to remove
	 * @ retrun {networkMap.Graph} self
	 */
	removeLink: function(link){
		this.links.erase(link);
		link.setGraph(null);
		return this;
	},

	/**
	 * Signal links to call the datasource to refresh.
	 *
	 * @ retrun {networkMap.Graph} self
	 */
	refresh: function(){
		console.log("refresh is depricated, use update instead");

		return this.update();
	},

	registerUpdateEvent: function(datasource, url, link, callback){
		this.$updateQ = this.$updateQ || {}; 
		this.$updateQ[datasource] = this.$updateQ[datasource] || {};
		this.$updateQ[datasource][url] = this.$updateQ[datasource][url] || [];

		// register datasources for internal use in the link
		this.$updateQ[datasource][url].push({
			link: link,
			callback: callback
		});
	},

	/**
	 * Refresh links in batch mode. This method does not work
	 * at the moment.
	 */
	update: function(){
		if (this.options.batchUpdate)
			return this.batchUpdate();		
		
		this.links.forEach(function(link){
			link.localUpdate();
		});

		return this;
	},
	
	batchUpdate: function(){
		networkMap.each(this.$updateQ, function(urls, datasource){
			if (!networkMap.datasource[datasource]){
				throw 'Unknown datasource (' + datasource + ')';
			}
			
			networkMap.each(urls, function(requests, url){
				networkMap.datasource[datasource](url, requests);
			}.bind(this));
		}.bind(this));
		
		return this;
	},
	
	


});;networkMap.Node = function(options){

	this.graph = options.graph;
	delete options.graph;

	this.properties = new networkMap.Properties(options, networkMap.Node.defaults);

	this.configurationWidget = new networkMap.Node.Module.Settings();

	/** TODO: Replace inline function with this.refresh */
	this.properties.addEvent('change', function(change){
		this.options = this.properties.configuration();

		// TODO: Remove hack for stoping redraw of node when dragged
		// TODO: Prevent click event after drag.
		if (change.length >= 1 && (change[0].key === 'x' || change[0].key === 'y'))
			return;

		this.draw();
	}.bind(this));

	this.options = this.properties.configuration();

	if (!this.options.id){
		throw "Node(create, no id given)";
	}
	
	this.options.x = parseFloat(this.options.x);
	this.options.y = parseFloat(this.options.y);
	this.options.padding = parseFloat(this.options.padding); 

	this.setGraph(this.graph);

};

networkMap.extend(networkMap.Node, networkMap.Options);
networkMap.extend(networkMap.Node, networkMap.Observable);
networkMap.extend(networkMap.Node, {
	
	
	_mode: 'normal',
	exportedOptions: [
		'id',
		'name',
		'comment',
		'x',
		'y',
		'lat',
		'lng',
		'weight',
		'renderer',
		'information',
		'label',
		'padding',
		'href',
		'style',
		'events',
		'fontFamily',
		'fontSize',
		'bgColor',
		'strokeColor',
		'strokeWidth' 
	],
	

	

	/**
	 * Update an option
	 *
	 * @param {string} The property to change
	 * @param {mixed} The value to set
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	setProperty: function(key, value){
		if (!this.editTemplate[key]){
			throw 'Unknow id: ' + key;
		}
		
		this.properties.set(key, value);
		this.options = this.properties.configuration();
				
		return this;
	},

	/**
	 * Ǵet a property value
	 *
	 * @param {string} The property to get
	 * @this {networkMap.Node}
	 * @return {mixed} The property value
	 */
	getProperty: function(key){
		
		return this.properties.get(key, true).value;
		//return this._localConfig[key];
	},

	/**
	 * Genereats a configuration object
	 *
	 * @this {networkMap.Node}
	 * @return {Object} The node configuration
	 */
	getConfiguration: function(){
		return this.properties.extract();
	},

	
	/**
	 * Enable an event on the node
	 *
	 * @param {string} The type of event [hover|click]
	 * @this {options} The options for event
	 * @return {networkMap.Node} self
	 */
	enableEvent: function(name, options){
		if (name !== 'hover' && name !== 'click'){
			throw "Unknown event";
		}
		
		this.options.events = this.options.events || {};		
		this._localConfig.events = this._localConfig.events || {};
		
		var defaultOptions = {enabled: true};
		this.options.events[name] = options || defaultOptions;
		this._localConfig.events[name] = options || defaultOptions;

		return this;
	},
	
	/**
	 * Disable an event on the node
	 *
	 * @param {string} The type of event [hover|click]
	 * @return {networkMap.Node} self
	 */
	disableEvent: function(name, options){
		if (this.options.events && this.options.events[name]){
			delete this.options.events[name];
			delete this._localConfig.events[name];
		}
		
		return this;
	},
	
	/**
	 * Set the graph that the Node is associated to. 
	 * If set to null the Node will unregister from the 
	 * graph.
	 *
	 * @param {networkMap.Graph} The graph
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	setGraph: function(graph){

		// remove the current graph if it excists		
		if (this.graph){
			this.graph.removeEvent('redraw', this._redraw.bind(this));
			this.graph = null;
			this.draw();
		}

		// add graph object if it exists
		if (graph){
			this.graph = graph;
			this.properties.setDefaults(graph.getDefaults('node'));
			this.graph.addEvent('redraw', this._redraw.bind(this));
			this.draw();
		}

		return this;
	},
	
	/* TODO: Depricate function */
	_redraw: function(){
		this.draw();
	},

	/**
	 * Get/set the mode of the node. The mode can either
	 * be "normal" or "edit". In "edit" mode the nodes 
	 * clickHandler will not forward click events to
	 * click events registed with networkMap.registerEvent
	 *
	 * @param {string} The mode or undefined to get the mode
	 * @this {networkMap.Node}
	 * @return {networkMap.Node|String} Returns either the mode or 
	 * self
	 */
	mode: function(mode){
		if (!mode){
			return this._mode;
		}
		
		if (mode === 'edit' || mode === 'normal'){
			this._mode = mode;
		}
		else{
			throw 'Unknown mode: ' + mode;	
		}
		
		return this;
	},

	/**
	 * The clickHandler is an internal function which forwards
	 * click events to either the registed click event or to the 
	 * settingsManager.
	 *
	 * @param {Event} The click event
	 * @this {networkMap.Node}
	 * @return {undefined}
	 */
	_clickhandler: function(e){
		if (e.target.instance.data('dragged')){
			return;
		}
		
		if (this._mode === 'normal' && this.options.events && this.options.events.click){
			networkMap.events.click(e, this);
		}
		else if (this._mode === 'edit'){
			e.preventDefault();

			this.graph.publish('edit', [this.configurationWidget.toElement(this.properties)]);
		}
	},	

	/**
	 * Get the x coordinate of the node
	 *
	 * @this {networkMap.Node}
	 * @return {number} The x coordinate of the node
	 */
	x: function(){
		return this.svg.bbox().x;
	},
	
	/**
	 * Get the y coordinate of the node
	 *
	 * @this {networkMap.Node}
	 * @return {number} The y coordinate of the node
	 */
	y: function(){
		return this.svg.bbox().y;
	},

	/**
	 * Make the node draggable
	 *
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	draggable: function(){
		this._draggable = true;
		this.svg.draggable({grid: this.graph.grid()});
		this.svg.remember('cursor', this.svg.style('cursor'));
		this.svg.style('cursor', 'move');
		
		return this;
	},	

	/**
	 * Make the node fixed, i.e. ńot draggable.
	 *
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	fixed: function(){
		this._draggable = false;
		this.svg.fixed();
		var cursor = this.svg.remember('cursor');
		this.svg.forget('cursor');
		this.svg.style('cursor', cursor || 'default');
		
		return this;
	},

	/**
	 * Returns true if the node is draggable
	 * false otherwise.
	 *
	 * @this {networkMap.Node}
	 * @return {boolean} The draggable status
	 */
	isDraggable: function(){
		return this._draggable;
	},

	/**
	 * This will create/update a link tag for the
	 * node. Order of presence is:
	 * - options.href
	 * - emit url event
	 *
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	updateLink: function(){
		var href = this.options.href;
		if (href){
			if (networkMap.isFunction(href))
				this.setLink(href(this));
			else
				this.setLink(href);
			return this;
		}
		
		this.fireEvent('requestHref', [this]);
		return this;
	},
	
	/**
	 * This will create/update the link to
	 * the specified URL.
	 *
	 * @param {string} The URL
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 * @TODO: Add functionality to remove the link
	 */
	setLink: function(url){
		if (url){
			if (this.link){
				this.link.to(url);
				return this;
			}
			
			this.link = this.svg.linkTo(url);
			return this;
		}
		
		return this;						
	},

	/**
	 * Get the bonding box of the node.
	 *
	 * @this {networkMap.Node}
	 * @return {SVG.BBox} The nodes bounding box
	 */
	bbox: function(){
		return this.svg.bbox();
	},

	/**
	 * Draw/redraw the node
	 *
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	draw: function(){
		var redraw = false;
		
		if (this.svg){
			this.svg.remove();
			if (this.link) link.remove();
		
			if (!this.graph)
				return false;			
			
			redraw = true;
		}
		
		if (!this.graph){
			return false;
		}
		
		if (this.debug){
			this.debug.remove();
		}
		
		if (this.options.debug){
			this.debug = this.graph.getPaintArea().group();
		}

		// create a group object 
		var svg = this.svg = this.graph.getPaintArea().group();
		
				
		this.updateLink();

		// create the label first to get size
		var label = svg.text(this.options.name)
			.font({
				family:   this.options.fontFamily,
				size:     this.options.fontSize,
				anchor:   'start',
				leading:  this.options.fontSize - 1
			})
			.move(parseFloat(this.options.padding), parseFloat(this.options.padding));

		
		// This is needed to center an scale the comment text
		// as it is not possible to get a bbox on a tspan
		var bboxLabel = label.bbox();
		var comment;
		if (this.options.comment && this.options.comment !== ''){
			label.text(function(add){
				add.tspan(this.options.name).newLine();
				comment = add.tspan(this.options.comment).newLine().attr('font-size', this.options.fontSize - 2);
			}.bind(this));
			comment.attr('text-anchor', 'middle');
			comment.dx(bboxLabel.width / 2);
		}	
		while (bboxLabel.width < label.bbox().width){
			comment.attr('font-size', comment.attr('font-size') - 1);
		}

		// create the rect
		bboxLabel = label.bbox();		
		var rect = svg.rect(1,1)
			.fill({ color: this.options.bgColor})
			.stroke({ color: this.options.strokeColor, width: this.options.strokeWidth })
			.attr({ 
				rx: 4,
				ry: 4
			})
			.size(
				bboxLabel.width + this.options.padding * 2, 
				bboxLabel.height + this.options.padding * 2
			);
							
		label.front();
		

		
		svg.on('click', this._clickhandler.bind(this));
		
		if (this.options.events){
			svg.link = this.options.events;
			
			if (this.options.events.click){
				svg.attr('cursor', 'pointer');
			}	
			
		}

		// this cover is here there to prevent user from selecting 
		// text in the label
		var cover = rect.clone().fill({opacity: 0}).front();

		// move it in place
		svg.move(parseFloat(this.options.x), parseFloat(this.options.y));
		
	
		
		if (this.options.draggable){
			this.draggable();
		}
		
		svg.dragstart = function(){
			this.fireEvent('dragstart');
		}.bind(this);
		svg.dragmove = function(delta, event){
			this.fireEvent('drag', [delta, event]);
		}.bind(this);
		svg.dragend = function(){
			console.log('dragend');
			this.properties.set({
				x: this.x(),
				y: this.y()
			});
			this.fireEvent('dragend');
		}.bind(this);
		
		// need to make sure the draggable state persists
		if (this.isDraggable()){
			this.draggable();
		}

		this.fireEvent('dragend');

		return true;
	}
});

networkMap.Node.defaultTemplate = {
	padding: {
		label: 'Padding',
		type: 'number',
		min: 0
	},
	fontSize: {
		label: 'Font size',
		type: 'number',
		min: 1
	},
	bgColor: {
		label: 'Color',
		type: 'color'
	},
	strokeColor: {
		label: 'Stroke color',
		type: 'color'
	},
	strokeWidth: {
		label: 'Stroke width',
		type: 'number',
		min: 0
	}
};

/**
 * Register a global handler to provide a href to Nodes
 * This can be overridden on the networkMap instance or
 * or setting it directly on the node.
 * 
 * The registered function should return a url string 
 * or null if no link should be created. See implementation
 * of networkMap.Node._linkGenerator for a reference 
 * implementation
 *
 * @param {function} A function that returns an URL or null
 */
networkMap.Node.registerLinkGenerator = function(f){
	networkMap.Node._linkGenerator = networkMap.Node.createLinkGenerator(f);
};

networkMap.Node.createLinkGenerator = function(f){
	return function(node){
		var href = node.properties.get('href');
		if (href){
			if (networkMap.isFunction(href))
				node.setLink(href());
			else
				node.setLink(href);
			return;
		}
		
		node.setLink(f(node));
	};
};


/** Register a default link generator which will not create a link */
networkMap.Node.registerLinkGenerator(function(node){return null;});


/** Register defaults properties for networkMap.Node */
networkMap.Node.defaults = new networkMap.Properties({
	name: null,
	comment: null,
	x: 10,
	y: 10,
	lat: null,
	lng: null,
	weight: null,
	fontFamily: 'Helvetica',
	fontSize: 16,
	bgColor: '#dddddd',
	strokeColor: '#000000',
	strokeWidth: 2,
	information: {

	},
	data:{
		value: null,
		realValue: null
	},
	label: {
		position: 'internal',
		visable: true
	},
	renderer: 'rect', //rect, circle, image(url), svg(ulr)
	padding: 10,
	href: null,
	style: null,
	debug: false,
	draggable: false
});


;networkMap.Node.Module = networkMap.Node.Module || {};

networkMap.Node.Module.Settings = function(properties){
	this.properties = properties;
};

// types: angle, bool, float, int, number, length, list, string, color
// https://api.tinkercad.com/libraries/1vxKXGNaLtr/0/docs/topic/Shape+Generator+Overview.html
networkMap.extend(networkMap.Node.Module.Settings, {

	/** Definitions of the parameters */
	parameters: {
		id: {
			label: 'ID',
			type: 'text',
			disabled: true,
			global: false
		},
		name: {
			label: 'Name',
			type: 'text',
			global: false
		},
		comment: {
			label: 'Comment',
			type: 'text',
			global: false
		},
		padding: {
			label: 'Padding',
			type: 'number',
			min: 0,
			global: true
		},
		fontSize: {
			label: 'Font size',
			type: 'number',
			min: 1,
			global: true
		},
		bgColor: {
			label: 'Color',
			type: 'color',
			global: true
		},
		strokeColor: {
			label: 'Stroke color',
			type: 'color',
			global: true
		},
		strokeWidth: {
			label: 'Stroke width',
			type: 'number',
			min: 0,
			global: true
		}
		
	},

	/**
	 * Generates HTML that is used for configuration
	 *
	 * @this {networkMap.Node}
	 * @return {Element} A HTML Element that contains the UI
	 */
	toElement: function(properties){
		var container = new networkMap.widget.Accordion();
		var accordionGroup;

		var changeHandler = function(key, properties){
			return function(e, widget){
				properties.set(key, widget.value());	
			};
		};
	
		accordionGroup = container.add('Globals');		
		networkMap.each(this.parameters, function(option, key){
			if (option.type === 'number'){
				accordionGroup.appendChild(new networkMap.widget.IntegerInput(option.label, properties.get(key), option).addEvent('change', changeHandler(key, properties)));
			}
			else if(option.type === 'text'){
				accordionGroup.appendChild(new networkMap.widget.TextInput(option.label, properties.get(key), option).addEvent('change', changeHandler(key, properties)));
			}
			else if (option.type === 'color'){
				accordionGroup.appendChild(new networkMap.widget.ColorInput(option.label, properties.get(key), option).addEvent('change', changeHandler(key, properties)));	
			}
		}.bind(this));
		
		return container;
	}
});;
networkMap.LinkPath = function(link, svg, options){
	// this.options = {};
	// this.setOptions(options);
	this.properties = new networkMap.Properties(options, link.properties);
	this.properties.addEvent('change', function(change){
		this.fireEvent('change', change);
	}.bind(this));

	this.link = link;
	this.svg = svg;
	
	// Check if we should setup an update event
	if (this.properties.get('requestUrl')) {
		this.link.registerUpdateEvent(
			this.properties.get('datasource'),
			this.properties.get('requestUrl'),
			this,
			function(response){
				this.link.updateBgColor(this, this.link.colormap.translate(response.value));
			}.bind(this)
		);
	}
	
	this.setupEvents();
};

networkMap.extend(networkMap.LinkPath, networkMap.Options);
networkMap.extend(networkMap.LinkPath, networkMap.Observable);
networkMap.extend(networkMap.LinkPath, {	
	remove: function(){
		this.svg.remove();
	},
	getEditables: function(){
		var editables = {
			width: {
				label: 'Local width',
				type: 'int'	
			}	
		};
		
		return editables;		
	},


	/**
	 * This will create/update a link tag for the
	 * link. Order of presence is:
	 * - options.href
	 * - emit url event
	 *
	 * @this {networkMap.Link}
	 * @return {networkMap.Link} self
	 */
	updateLink: function(){
		var href = this.properties.get('href');
		if (href){
			if (networkMap.isFunction(href))
				this.setLink(href(this));
			else
				this.setLink(href);
			return this;
		}
		
		this.fireEvent('requestHref', [this]);
		return this;
	},

	/**
	 * This will create/update the link to
	 * the specified URL.
	 *
	 * @param {string} The URL
	 * @this {networkMap.Link}
	 * @return {networkMap.Link} self
	 * @TODO: Add functionality to remove the link
	 */
	setLink: function(url){
		if (url){
			if (this.a){
				this.a.to(url);
				return this;
			}

			if (this.svg.parent){
				this.a = this.svg.linkTo(url);
			}
			
			return this;
		}
		
		return this;						
	},	
	
	getLink: function(){
		return this.link;
	},
	/**
	 * Get the node which is assosiated to the linkPath
	 *
	 * @retrun {networkMap.Node} The node which this is assosiated with.
	 */
	getNode: function(){
		return this.getLink().getNode(this);
	},
	getSettingsWidget: function(){
		return this.getLink().getSettingsWidget();
	},
	getProperty: function(key){
		return this.properties.get(key);
		/* TODO: Remove
		if (key == 'width'){
			var link = this.getMainPath();
			if (link != this){
				return link.getProperty(key);
			}
			else if (!this.options[key]){
				return this.link.options[key];
			}
		}
		
		if (!this.options[key]){
			return null;
		}
		
		return this.options[key];
		*/
	},
	setProperty: function(key, value){
		if (key == 'width'){
			var link = this.getMainPath();
			if (link != this){
				return link.setProperty(key, value);
			}
		}
				
		this.properties.set(key, value);
		//TODO: Remove
		//this.options[key] = value;
		this.fireEvent('change', [key]);
		return this;
	},
	getConfiguration: function(){
		return this.properties.extract();
	},
	getMainPath: function(){
		var link;
		
		if (this.link.subpath.nodeA){
			this.link.subpath.nodeA.forEach(function(sublink){
				if (this == sublink){
					link = this.link.path.nodeA;
				}
			}.bind(this));
			
			if (link){
				return link;
			}		
		}
		
		if (this.link.subpath.nodeB){
			this.link.subpath.nodeB.forEach(function(sublink){
				if (this == sublink){
					link = this.link.path.nodeB;
				}
			}.bind(this));
			
			if (link){
				return link;
			}		
		}
		
		return this;
		
	},
	setupEvents: function(){
		this.svg.on('click', this._clickHandler.bind(this));
		
		if (this.properties.get('events')){
			if (this.properties.get('events.click')){
				this.svg.attr('cursor', 'pointer');
			}

			if (this.properties.get('events.hover')){
				this.svg.on('mouseover', this._hoverHandler.bind(this));
				this.svg.on('mouseout', this._hoverHandler.bind(this));
			}
		}
	},
	_clickHandler: function(e){
		if (this.link.mode() === 'normal' && this.properties.get('events.click')){
			networkMap.events.click(e, this);
		}
		else if (this.link.mode() === 'edit'){
			e.preventDefault();

			this.link.graph.publish('edit', [this.link.configurationWidget.toElement(this.link, this.link.properties)]);
		}
	},
	_hoverHandler: function(e){
		if (this.link.mode() === 'edit'){
			return;
		}
		
		if (e.type === 'mouseover'){
			networkMap.events.mouseover(e, this);
		}
		if (e.type === 'mouseout'){
			networkMap.events.mouseout(e, this);
		}
	}
});
;networkMap.Link = function(options){
	

	/** internal debug variable, 0 = off, 1 = normal debug */
	this.$debug = 0;
	this.pathPoints = [];
	this.svgEl = {};
	this.updateQ = {};
	this._mode = 'normal';
	this.path = {};
	this.subpath = {};

	var link, sublink;
	
	this.graph = options.graph;
	delete options.graph;		

	this.properties = new networkMap.Properties(options, networkMap.Link.defaults);
	this.properties.addEvent('change', function(change){
		this.options = this.properties.configuration();
		this.draw();
	}.bind(this));

	// TODO: Remove this hack
	this.options = this.properties.configuration();

	this.configurationWidget = new networkMap.Link.Module.Settings();

	this.colormap = networkMap.colormap[this.properties.get('colormap')];

	// setup datasource
	this.datasource = networkMap.datasource[this.properties.get('datasource')];


	this.setGraph(this.graph);
};

networkMap.extend(networkMap.Link, networkMap.Options);
networkMap.extend(networkMap.Link, networkMap.Observable);

networkMap.extend(networkMap.Link, {

	exportedOptions: [
		'inset',
		'connectionDistance',
		'staticConnectionDistance',
		'arrowHeadLength',
		'width',
		'background'
	],
	
	editTemplate: {
		width: {
			label: 'Width',
			type: 'number',
			min: 0
		},
		inset: {
			label: 'Inset',
			type: 'number',
			min: 1
		},
		connectionDistance: {
			label: 'Chamfer',
			type: 'number',
			min: 0
		},
		staticConnectionDistance: {
			label: 'Offset',
			type: 'number',
			min: 1
		},
		arrowHeadLength: {
			label: 'Arrow Head',
			type: 'number',
			min: 0
		}
	},
	

	getEditables: function(){
		return this.editTemplate;
	},
	setProperty: function(key, value){
		if (!this.editTemplate[key]){
			throw 'Unknow id: ' + key;
		}
		
		this.options[key] = value;
		this._localConfig[key] = value;
		
		this.redraw();
	},
	getProperty: function(key){
		if (!this.editTemplate[key]){
			throw 'Unknow id: ' + key;
		}
		
		return this.properties.get(key);
	},
	
	/**
	 * This will create/update a link tag for the
	 * node. Order of presence is:
	 * - options.href
	 * - emit url event
	 *
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	updateLink: function(){
		if (this.subpath.nodeA){
			this.subpath.nodeA.forEach(function(sublink){
				sublink.updateLink();
			});
		}

		if (this.subpath.nodeB){
			this.subpath.nodeB.forEach(function(sublink){
				sublink.updateLink();
			});
		}
		if (this.path.nodeA)
			this.path.nodeA.updateLink();
		if (this.path.nodeB)
			this.path.nodeB.updateLink();
		return this;
	},	
	
	/**
	 * Get the node which is assosiated a linkPath
	 *
	 * @param {networkMap.LinkPath} linkPath 
	 * @retrun {networkMap.Node} The node which the linkPath is associated with.
	 */
	getNode: function(linkPath){
		var any = function(path){
			if (path === linkPath){
				return true;	
			}
		};
		
		if (this.path.nodeA === linkPath){
			return this.nodeA;
		}
		
		if (this.subpath.nodeA){
			if (this.subpath.nodeA.some(any, this)){
				return this.nodeA;	
			}
		}
		
		if (this.path.nodeB === linkPath){
			return this.nodeB;
		}
		
		if (this.subpath.nodeB){
			if (this.subpath.nodeB.some(any, this)){
				return this.nodeB;	
			}
		}
		
		throw "Link is not found";		
	},
	connectedTo: function(node, secondaryNode){
		if (secondaryNode){
			return (this.nodeA == node || this.nodeB == node) && (this.nodeA == secondaryNode || this.nodeB == secondaryNode);
		}
		
		return (this.nodeA == node || this.nodeB == node); 
	},
	mode: function(mode){
		if (!mode){
			return this._mode;
		}
		
		if (mode === 'edit' || mode === 'normal'){
			this._mode = mode;
		}
		else{
			throw 'Unknown mode: ' + mode;	
		}
		
		return this;
	},
	getConfiguration: function(){
		
		var configuration = this.properties.extract();

		if (this.path.nodeA){
			configuration.nodeA = this.path.nodeA.getConfiguration();			
		}		
		if (this.subpath.nodeA){
			configuration.nodeA = configuration.nodeA || {};
			configuration.nodeA.sublinks = [];
			this.subpath.nodeA.forEach(function(subpath){
				configuration.nodeA.sublinks.push(subpath.getConfiguration());
			});
		}
		
		if (this.path.nodeB){
			configuration.nodeB = this.path.nodeB.getConfiguration();			
		}		
		if (this.subpath.nodeB){
			configuration.nodeB = configuration.nodeB || {};
			configuration.nodeB.sublinks = [];
			this.subpath.nodeB.forEach(function(subpath){
				configuration.nodeB.sublinks.push(subpath.getConfiguration());
			});
		}

		return configuration;
		

	},
	setGraph: function(graph){	
		// remove the object from the graph
		if (graph === null){
			this.graph = null;
			this.draw();
		}

		// if a graph is defined draw 
		if (graph){
			this.graph = graph;
			this.properties.setDefaults(this.graph.getDefaults('link'));
			this.options.datasource = this.options.datasource || this.graph.options.datasource;

			// TODO: Legacy code
			this.graph.addEvent('redraw', function(e){
				this.draw();
			}.bind(this));

			this._setupSVG(this.properties.configuration());
			this.draw();
		}
	},

	_setupSVG: function(options){
		this.svg = this.graph.getPaintArea().group();


		if (!options.nodeA || !options.nodeB){
			throw "Link(create, missing node in link definition)";
		}

		this.nodeA = this.graph.getNode(options.nodeA.id);
		if (!this.nodeA){
			throw "Link(create, nodeA does not exist (" + this.options.nodeA.id + ")";
		}

		link = options.nodeA;
		
		if (link.sublinks){
			sublinks = link.sublinks;
			delete link.sublinks;
			this.subpath.nodeA = [];
			sublinks.forEach(function(sublink){
				this.subpath.nodeA.push(
					new networkMap.LinkPath(this, networkMap.path(this.svg), sublink)
					.addEvent('change', this.redraw.bind(this))
					.addEvent('requestHref', function(sublink){this.fireEvent('requestHref', [sublink]);}.bind(this))
				);
			}.bind(this));
		}
		this.path.nodeA = new networkMap.LinkPath(
			this,
			networkMap.path(this.svg), 
			link
		).addEvent('change', this.redraw.bind(this))
		.addEvent('requestHref', function(sublink){this.fireEvent('requestHref', [sublink]);}.bind(this));
		
		
		// add a holder for SVG objects
		if (this.options.nodeA.requestData || this.options.nodeA.sublinks){
			this.svgEl.nodeA = {};

			if (this.options.nodeA.sublinks){
				this.svgEl.nodeA.sublinks = [];
			}
		}

		this.nodeB = this.graph.getNode(options.nodeB.id);
		if (!this.nodeB){
			throw "Link(create, nodeB does not exist (" + this.options.nodeB.id + ")";
		}

		link = options.nodeB;

		if (link.sublinks){
			sublinks = link.sublinks;
			delete link.sublinks;
			this.subpath.nodeB = [];
			sublinks.forEach(function(sublink){
				this.subpath.nodeB.push(
					new networkMap.LinkPath(this, networkMap.path(this.svg), sublink)
					.addEvent('change', this.redraw.bind(this))
					.addEvent('requestHref', function(sublink){this.fireEvent('requestHref', [sublink]);}.bind(this))
				);
			}.bind(this));
		}
		this.path.nodeB = new networkMap.LinkPath(
			this, 
			networkMap.path(this.svg), 
			link
		).addEvent('change', this.redraw.bind(this))
		.addEvent('requestHref', function(sublink){this.fireEvent('requestHref', [sublink]);}.bind(this));
		
		// Add a holder for SVG objects
		if (this.options.nodeB.requestData || this.options.nodeB.sublinks){
			this.svgEl.nodeB = {};

			if (this.options.nodeB.sublinks){
				this.svgEl.nodeB.sublinks = [];
			}

		}
	},

	_cleanDebugLayer: function(){
		if (this.debug){
			this.debug.clear();
		}
		if (this.options.debug && !this.debug){
			this.debug = this.graph.getPaintArea().group();
		}
	},
	redraw: function(){
		this.redrawShadowPath();
		this.drawMainPath();
		this.drawSublinks();
		return this;
	},
	draw: function(){
		if (this.svg && !this.graph){
			this.svg.remove();
			return false;
		}

		if (!this.graph){
			return false;
		}

		this._cleanDebugLayer();

		// create a group object 
		var svg = this.svg;
		svg.back();
		
		var bboxA = this.nodeA.bbox();
		var bboxB = this.nodeB.bbox();
		this.shadowPath = svg.path().attr({ 
			fill: 'none',
			stroke: '#000', 
			'stroke-dasharray': '3,5',
			'stroke-width': 2 
		});

		this.redrawShadowPath().hideShadowPath();
		this.drawMainPath();
		this.drawSublinks();
		this.update();

		this.nodeA.addEvent('drag', function(delta, event){
			this._cleanDebugLayer();
			this.redrawShadowPath();
		}.bind(this));

		this.nodeB.addEvent('drag', function(delta, event){
			this._cleanDebugLayer();
			this.redrawShadowPath();
		}.bind(this));

		this.nodeA.addEvent('dragstart', function(event){
			this.shadowPath.show();
			this.hidePaths();
		}.bind(this));
		this.nodeB.addEvent('dragstart', function(event){
			this.shadowPath.show();
			this.hidePaths();
		}.bind(this));

		this.nodeA.addEvent('dragend', function(event){
			this.redrawShadowPath().hideShadowPath();
			this.drawMainPath();
			this.drawSublinks();
			this.showPaths();
			
		}.bind(this));
		this.nodeB.addEvent('dragend', function(event){
			this.redrawShadowPath().hideShadowPath();
			this.drawMainPath();
			this.drawSublinks();
			this.showPaths();
		}.bind(this));

	},

	vec2add: function(a, b, out){
		out = out || [0, 0];

		out[0] = a[0] + b[0];
		out[1] = a[1] + b[1];

		return out;
	},

	vec2sub: function(a, b, out){
		out = out || [0, 0];

		out[0] = a[0] - b[0];
		out[1] = a[1] - b[1];

		return out;
	},

	vec2distance: function(a, b){
		var x = b[0] - a[0],
		y = b[1] - a[1];
		return Math.sqrt(x*x + y*y);
	},

	vec2len: function(a){
		var x = a[0],
		y = a[1];
		return Math.sqrt(x*x + y*y);
	},

	vec2normalize: function(a, out) {
		out = out || [0, 0];
		var x = a[0],
			y = a[1];
		var len = x*x + y*y;
		if (len > 0) {
			len = 1 / Math.sqrt(len);
			out[0] = a[0] * len;
			out[1] = a[1] * len;
		}
		return out;
	},

	vec2maxDir: function(a, out){
		out = out || [0, 0];
		var al0 = Math.abs(a[0]);
		var al1 = Math.abs(a[1]);

		if (al0 > al1){
			out[0] = a[0]/al0;
			out[1] = 0;
		}
		else{
			out[0] = 0;
			out[1] = a[1]/al1;
		}
		return out;
	},

	vec2scale: function(a, b, out){
		out = out || [0, 0];

		out[0] = a[0] * b;
		out[1] = a[1] * b;		

		return out;
	},

	vec2mul: function(a, b, out){
		out = out || [0, 0];

		out[0] = a[0] * b[0];
		out[1] = a[1] * b[1];		

		return out;
	},

	vec2confine: function(a, b, out){
		out = out || [0, 0];

		out[0] = (Math.abs(a[0]) < Math.abs(b[0])) ? a[0] : a[0]/Math.abs(a[0])*b[0];
		out[1] = (Math.abs(a[1]) < Math.abs(b[1])) ? a[1] : a[1]/Math.abs(a[1])*b[1];

		return out;
	},

	vec2clone: function(a, out){
		out = out || [0, 0];
		out[0] = a[0];
		out[1] = a[1];

		return out;	
	},

	edgePoints: function(){
		var bboxA = this.nodeA.bbox();
		var bboxB = this.nodeB.bbox();
		var confinmentA = [bboxA.width/2, bboxA.height/2];
		var confinmentB = [bboxB.width/2, bboxB.height/2];

		var path = [];
		var inset = this.properties.get('inset') || 1;
		var connectionDistance = this.properties.get('connectionDistance') || 1;
		var staticConnectionDistance = this.properties.get('staticConnectionDistance') || 1;

		var a = [bboxA.cx, bboxA.cy];
		var b = [bboxB.cx, bboxB.cy];

		var ab = this.vec2sub(b,a);

		var dirA = this.vec2maxDir(ab);

		var edgePointA = [0, 0];
		this.vec2mul(dirA, confinmentA, edgePointA);
		this.vec2sub(edgePointA, this.vec2scale(dirA, inset), edgePointA);
		var baseA = this.vec2clone(edgePointA);
		this.vec2add(a, edgePointA, edgePointA);

		//var edgeNodeA = this.vec2add(a, this.vec2confine(this.vec2scale(dirA, inset), confinmentA));
		path.push(edgePointA);
		path.push(this.vec2add(a, this.vec2add(baseA, this.vec2scale(dirA, connectionDistance))));
		this.vec2add(baseA, this.vec2scale(dirA, connectionDistance), baseA);
		path.push(this.vec2add(a, this.vec2add(baseA, this.vec2scale(dirA, staticConnectionDistance))));

		var ba = [ab[0]*-1, ab[1]*-1];
		var dirB = this.vec2maxDir(ba);

		var edgePointB = [0, 0];
		this.vec2mul(dirB, confinmentB, edgePointB);
		this.vec2sub(edgePointB, this.vec2scale(dirB, inset), edgePointB);
		var baseB = this.vec2clone(edgePointB);
		this.vec2add(b, edgePointB, edgePointB);

		//var edgeNodeB = this.vec2add(b, this.vec2confine(this.vec2scale(dirB, inset), confinmentB));
		baseBB = [0, 0];
		this.vec2add(baseB, this.vec2scale(dirB, connectionDistance), baseBB);
		path.push(this.vec2add(b, this.vec2add(baseBB, this.vec2scale(dirB, staticConnectionDistance))));
		path.push(this.vec2add(b, this.vec2add(baseB, this.vec2scale(dirB, connectionDistance))));
		path.push(edgePointB);
		
		this.$edgePoints = {
			nodeA: {
				point: new SVG.math.Point(edgePointA[0], edgePointA[1]),
				direction: dirA
			},
			nodeB: {
				point: new SVG.math.Point(edgePointB[0], edgePointB[1]),
				direction: dirB
			},
			path: path
		};

		return this.$edgePoints;
	},

	drawEdgeHandle: function(edge){
		var svg = edge.svg = edge.svg || this.graph.getPaintArea().group();
		var vec = [0,0];
		this.vec2scale(edge.direction, 30, vec);
		this.vec2add([edge.point.x, edge.point.y], vec, vec);
		var path = svg.path()
			.M(edge.point)
			.L(vec[0], vec[1])
			.stroke({
				fill: 'none',
				color: '#000',
				dasharray: '3 3',
				width: 1,

			});

		var handle = svg.circle(10)
			.center(vec[0], vec[1])
			.fill('#fff')
			.stroke({
				color: '#000',
			})
			.draggable({fn: function(p){
				var vec2 = [p.x, p.y];
				var edge2 = [edge.point.x, edge.point.y];
				var res = this.vec2add(
					this.vec2scale(
						this.vec2normalize(this.vec2sub(vec2, edge2)),
						30
					),
					edge2
				);
				return {x: res[0], y: res[1]};
			}.bind(this)});

		var bbox = this.nodeA.bbox();
		var edgeHandle = handle
			.clone()
			.addTo(svg)
			.center(edge.point.x, edge.point.y)
			.draggable({
				minX: bbox.x, 
				maxX: bbox.x + bbox.width,
				minY: bbox.y,
				maxY: bbox.y + bbox.height
			});

		edgeHandle.dragmove = function(delta, e){
			var vec = [0,0];
			this.vec2scale(edge.direction, 30, vec);
			handle.center(e.target.instance.cx() + vec[0], e.target.instance.cy() + vec[1]);
			console.log(e.target.instance.cx() + vec[0], e.target.instance.cy() + vec[1]);
		}.bind(this);

		svg.front();

		return this;
	},

	redrawShadowPath: function(){

		var edgePoints = this.edgePoints();

		this.pathPoints.length = 0;
		edgePoints.path.forEach(function(point){
			this.pathPoints.push(new SVG.math.Point(point[0], point[1]));
		}.bind(this));

		this.shadowPath
			.clear()
			.M.apply(this.shadowPath, edgePoints.path[0])
			.L.apply(this.shadowPath, edgePoints.path[2])
			.L.apply(this.shadowPath, edgePoints.path[3])
			.L.apply(this.shadowPath, edgePoints.path[5]);



		return this;
	},
	removeMainPath: function(){
		if (this.mainPathA)
			this.mainPathA.remove();

		if(this.mainPathB)
			this.mainPathB.remove();
	},
	hidePaths: function(){
		if (this.path.nodeA){
			this.path.nodeA.svg.hide();
		}
		if (this.subpath.nodeA){
			this.subpath.nodeA.forEach(function(subpath){
					subpath.svg.hide();
			});
		}
		if (this.path.nodeB){
			this.path.nodeB.svg.hide();
		}
		if (this.subpath.nodeB){
			this.subpath.nodeB.forEach(function(subpath){
					subpath.svg.hide();
			});
		}

		return this;
	},
	showPaths: function(){
		if (this.path.nodeA){
			this.path.nodeA.svg.show();
		}
		if (this.subpath.nodeA){
			this.subpath.nodeA.forEach(function(subpath){
					subpath.svg.show();
			});
		}
		if (this.path.nodeB){
			this.path.nodeB.svg.show();
		}
		if (this.subpath.nodeB){
			this.subpath.nodeB.forEach(function(subpath){
					subpath.svg.show();
			});
		}

		return this;
	},
	showShadowPath: function(){
		this.shadowPath.show();
		return this;
	},
	hideShadowPath: function(){
		this.shadowPath.hide();
		return this;
	},


	drawMainPath: function(){
		var maxLinkCount = 1;

		/* TODO: debug code */
		/*
		this.debug = this.debug || this.graph.getPaintArea().group();
		this.debug.clear();
		var edgePoints = this.edgePoints();
		edgePoints.nodeA.draw(this.debug);
		edgePoints.nodeB.draw(this.debug);
		this.debug.front();
		*/
		
		var drawNormalPath = function(sublink, pathPoints, options){
			var width = sublink.getProperty('width');
			var firstSegment = new SVG.math.Line(pathPoints[0], pathPoints[2]);
			var midSegment = new SVG.math.Line(pathPoints[2], pathPoints[3]);
	
			// perpendicular line with last point in firstList
			var helpLine1 = firstSegment.perpendicularLine(pathPoints[1], maxLinkCount * width);
			var helpLine2 = firstSegment.perpendicularLine(pathPoints[2], maxLinkCount * width);
			var helpLine3 = midSegment.perpendicularLine(pathPoints[2], maxLinkCount * width);
			
			var midPoint = midSegment.midPoint();
			var helpPoint1 = midSegment.move(midPoint, midSegment.p1, sublink.link.options.arrowHeadLength);
			var helpPoint2 = midSegment.move(midPoint, midSegment.p2, sublink.link.options.arrowHeadLength);
			
			var helpLine4 = midSegment.perpendicularLine(helpPoint1, maxLinkCount * width);
	
			// find intersection point 1
			var helpLine5 = new SVG.math.Line(helpLine1.p1, helpLine2.p1);
			var helpLine6 = new SVG.math.Line(helpLine3.p1, helpLine4.p1);
			var intersectPoint1 = helpLine6.intersection(helpLine5);
	
			if (intersectPoint1.parallel === true){
				intersectPoint1 = helpLine1.p1;
			}
	
			// find intersection point 2
			helpLine5 = new SVG.math.Line(helpLine1.p2, helpLine2.p2);
			helpLine6 = new SVG.math.Line(helpLine3.p2, helpLine4.p2);
			var intersectPoint2 = helpLine6.intersection(helpLine5);
	
			if (intersectPoint2.parallel === true){
				intersectPoint2 = helpLine1.p2;
			}
			
			sublink.svg.clear();
			
			sublink.svg
				.M(pathPoints[0])
				.L(helpLine1.p1).L(intersectPoint1).L(helpLine4.p1)
				.L(midPoint)
				.L(helpLine4.p2).L(intersectPoint2).L(helpLine1.p2)
				.Z().front();
		
		};
		
		var drawBondPath = function(sublink, pathPoints, linkCount){
			var width = sublink.getProperty('width');
			var midSegment = new SVG.math.Line(pathPoints[2], pathPoints[3]);
	
			var midPoint = midSegment.midPoint();
			var helpPoint1 = midSegment.move(midPoint, midSegment.p1, sublink.link.options.arrowHeadLength);
			
			var helpLine4 = midSegment.perpendicularLine(helpPoint1, linkCount * width / 2);
			
			var startPoint = new SVG.math.Line(pathPoints[2], midPoint).midPoint();
			var helpLine7 = midSegment.perpendicularLine(
				startPoint, 
				linkCount * width / 2
			);
	
		
			
			sublink.svg.clear();
			
			sublink.svg
				.M(startPoint)
				.L(helpLine7.p1).L(helpLine4.p1)
				.L(midPoint)
				.L(helpLine4.p2).L(helpLine7.p2)
				.Z().front();
		};
		
		var drawSinglePath = function(){
			
		};
		
		var drawSingleBondPath = function(){
			
		};

		
		
		var path;
		
				
		if (this.options.nodeA.requestUrl){
			path = [
				this.pathPoints[0],
				this.pathPoints[1],
				this.pathPoints[2],
				this.pathPoints[3]
			];

			if (this.subpath.nodeA){
				if (this.options.nodeB.requestUrl || this.subpath.nodeB){
					drawBondPath(this.path.nodeA, path, this.subpath.nodeA.length);
				}
				else {
					drawSingleBondPath();
				}
			}
			else{
				if (this.options.nodeB.requestUrl || this.subpath.nodeB){
					drawNormalPath(this.path.nodeA, path);
				}
				else {
					drawSinglePath();	
				}
			}
		}
		else{
			// remove the svg if it's not going to be used.
			this.path.nodeA.remove();	
		}
		
		if (this.options.nodeB.requestUrl){
			path = [
				this.pathPoints[5],
				this.pathPoints[4],
				this.pathPoints[3],
				this.pathPoints[2]
			];
			
			if (this.subpath.nodeB){
				if (this.options.nodeA.requestUrl || this.subpath.nodeA){
					drawBondPath(this.path.nodeB, path, this.subpath.nodeB.length);
				}
				else {
					drawSingleBondPath();
				}
			}
			else {
				if (this.options.nodeA.requestUrl || this.subpath.nodeA){
					drawNormalPath(this.path.nodeB, path);
				}
				else {
					drawSinglePath();	
				}
			}
		}
		else{
			// remove the svg if it's not going to be used.
			this.path.nodeB.remove();	
		}
		return this;
	},



	drawArc: function(){
		
	},
		
	
	drawSublinks: function(){
		var maxLinkCount, lastSegment, offset, path, width;
		
		/** The sign will change the draw order */
		var draw = function(sublink, startPoint, path, sign){
			var index = 0;

			var updateColor = function(self, path){
				return function(response){
					this.updateBgColor(path, this.colormap.translate(response.value));
				}.bind(self);
			};
			
			while (offset >= -maxLinkCount / 2){
				var opts = {
					width: +width,
					linkCount: maxLinkCount
				};

				var currentSegment = this.calculateSublinkPath(path, offset * sign, opts);

				if (lastSegment){
					
					sublink[index].svg.clear();

					// Special case when we are ploting a odd number
					// of sublinks. We must add the middlepoint manually
					if (offset === -0.5){
						sublink[index].svg
							.M(startPoint)
							.L(lastSegment[0]).L(lastSegment[1]).L(lastSegment[2])
							.L(path[path.length - 1])
							.L(currentSegment[2]).L(currentSegment[1]).L(currentSegment[0])
							.Z().back();
					}
					else{
						sublink[index].svg
							.M(startPoint)
							.L(lastSegment[0]).L(lastSegment[1]).L(lastSegment[2])
							.L(currentSegment[2]).L(currentSegment[1]).L(currentSegment[0])
							.Z().back();
					}
		
					index += 1;
				}
				lastSegment = currentSegment;
				offset -= 1;
			}
		}.bind(this);

		if (this.subpath.nodeA){
			maxLinkCount = this.subpath.nodeA.length;
			lastSegment = null;
			offset = maxLinkCount / 2;
			path = [
				this.pathPoints[0],
				this.pathPoints[1],
				this.pathPoints[2],
				new SVG.math.Line(this.pathPoints[2], this.pathPoints[3]).midPoint()
			];
			width = this.path.nodeA.getProperty('width') || this.options.width;
			draw(this.subpath.nodeA, this.pathPoints[0], path, 1);
		}
		if (this.subpath.nodeB){
			maxLinkCount = this.subpath.nodeB.length;
			lastSegment = null;
			offset = maxLinkCount / 2;
			path = [
				this.pathPoints[5],
				this.pathPoints[4],
				this.pathPoints[3],
				new SVG.math.Line(this.pathPoints[3], this.pathPoints[2]).midPoint()
			];
			width = this.path.nodeB.getProperty('width') || this.options.width;
			draw(this.subpath.nodeB, this.pathPoints[5], path, -1);
		}

		return this;
	},
	calculateSublinkPath: function(path, offset, options){
		var localWidth = options.width || this.options.width;
		var width = localWidth * offset;
		var angle = Math.atan2(this.options.arrowHeadLength, Math.abs(localWidth * options.linkCount / 2));
		var arrowHeadLength = Math.abs(width * Math.tan(angle)); 

		var firstSegment = new SVG.math.Line(path[0], path[2]);
		var midSegment = new SVG.math.Line(path[2], path[3]);

		// perpendicular line with last point in firstList
		var helpLine1 = firstSegment.perpendicularLine(path[1], width);
		var helpLine2 = firstSegment.perpendicularLine(path[2], width);
		var helpLine3 = midSegment.perpendicularLine(path[2], width);

		// find the arrowhead distance
		var arrowHeadInset = midSegment.move(midSegment.p2, midSegment.p1, arrowHeadLength);
		var arrowHeadStart = midSegment.perpendicularLine(arrowHeadInset, width);

		// find intersection point 1
		var helpLine5 = new SVG.math.Line(helpLine1.p1, helpLine2.p1);
		var helpLine6 = new SVG.math.Line(helpLine3.p1, arrowHeadStart.p1);
		var intersectPoint1 = helpLine6.intersection(helpLine5);

		if (intersectPoint1.parallel === true){
			intersectPoint1 = helpLine1.p1;
		}

		return [
			helpLine1.round(2).p1,
			intersectPoint1.round(2),
			arrowHeadStart.round(2).p1
		];
	},
	
	setInterval: function(){
		console.log('Seting link update interval');
		this.intervalId = setInterval(function(){
			this.update();
		}.bind(this), this.options.refreshInterval);
	},
	

	clearInterval: function(){
		console.log('removing link update interval');
		if (this.intervalId){
			clearInterval(this.intervalId);
			delete this.intervalId;
		}

		return this;
	},

	registerUpdateEvent: function(datasource, url, link, callback){
		var graph;
		
		this.updateQ[datasource] = this.updateQ[datasource] || {};
		this.updateQ[datasource][url] = this.updateQ[datasource][url] || [];

		// register datasources for internal use in the link
		this.updateQ[datasource][url].push({
			link: link,
			callback: callback
		});
		
		// register the update event in the graf
		this.graph.registerUpdateEvent(datasource, url, link, callback);
	},

	/** This is depricated */
	localUpdate: function(){
		console.log('localUpdate is depricated, please use update instead');
		
		if (!this.graph.options.batchUpdate)
			return this.update();
	}, 

	update: function(force){
		if (this.properties.get('globalRefresh') || force !== true)
			return this;

		if (!this.graph.options.batchUpdate)
		networkMap.each(this.updateQ, function(urls, datasource){
			if (!networkMap.datasource[datasource]){
				throw 'Unknown datasource (' + datasource + ')';
			}
			networkMap.each(urls, function(requests, url){
				if (this.options.batchUpdate){
					networkMap.datasource[datasource](url, requests);
				}
				else{
					requests.forEach(function(request){
						networkMap.datasource[datasource](url, request);
					});
				}
			}.bind(this));
		}.bind(this));
		
		return this;
	},

	updateBgColor: function(path, color){
		if (!color){
			path.svg.fill(this.options.background);
		}
		else{
			path.svg.fill(color);
		}
	}

});

networkMap.Link.defaultTemplate = {
	width: {
		label: 'Width',
		type: 'number',
		min: 0
	},
	inset: {
		label: 'Inset',
		type: 'number',
		min: 1
	},
	connectionDistance: {
		label: 'Chamfer',
		type: 'number',
		min: 0
	},
	staticConnectionDistance: {
		label: 'Offset',
		type: 'number',
		min: 1
	},
	arrowHeadLength: {
		label: 'Arrow Head',
		type: 'number',
		min: 0
	}
};

/**
 * Register a global handler to provide a href to Links
 * This can be overridden on the networkMap instance or
 * or setting it directly on the link.
 * 
 * The registered function should return a url string 
 * or null if no link should be created.
 *
 * @param {function} A function that returns a URL or null
 */
networkMap.Link.registerLinkGenerator = function(f){
	networkMap.Link._linkGenerator = networkMap.Link.createLinkGenerator(f);
};

networkMap.Link.createLinkGenerator = function(f){
	return function(sublink){
		var href = sublink.properties.get('href');
		if (href){
			if (networkMap.isFunction(href))
				sublink.setLink(href());
			else
				sublink.setLink(href);
			return;
		}
		
		sublink.setLink(f(sublink));
	};
};

/** Register a default link generator which will not create a link */
networkMap.Link.registerLinkGenerator(function(sublink){return null;});

/** Register defaults properties for networkMap.Node */
networkMap.Link.defaults = new networkMap.Properties({
	inset: 10,
	connectionDistance: 10,
	staticConnectionDistance: 30,
	arrowHeadLength: 10,
	width: 10,
	debug: false,
	background: '#777',
	globalRefresh: true,
	refreshInterval: 300000,
	datasource: 'simulate',
	batchUpdate: true,
	colormap: 'flat5'
});
;networkMap.Link.Module = networkMap.Link.Module || {};

networkMap.Link.Module.Settings = function(properties){
	this.properties = properties;
};

// types: angle, bool, float, int, number, length, list, string, color
// https://api.tinkercad.com/libraries/1vxKXGNaLtr/0/docs/topic/Shape+Generator+Overview.html
networkMap.extend(networkMap.Link.Module.Settings, {

	/** Definitions of the parameters */
	parameters: {
		width: {
			label: 'Width',
			type: 'number',
			min: 0,
			global: true
		},
		inset: {
			label: 'Inset',
			type: 'number',
			min: 1,
			global: true
		},
		connectionDistance: {
			label: 'Chamfer',
			type: 'number',
			min: 0,
			global: true
		},
		staticConnectionDistance: {
			label: 'Offset',
			type: 'number',
			min: 1,
			global: true
		},
		arrowHeadLength: {
			label: 'Arrow Head',
			type: 'number',
			min: 0,
			global: true
		}
	},

	/**
	 * Generates HTML that is used for configuration
	 * @param  {networkMap.Link} link       The link object
	 * @param  {networkMap.Properties} properties The properties of the link object
	 * @return {HTMLElement}            A HTMLElement containing the widget
	 */	
	toElement: function(link, properties){
		var container = new networkMap.widget.Accordion();
		var accordionGroup;

		var changeHandler = function(key, obj){
			return function(e, widget){
				obj.set(key, widget.value());	
			};
		};
	
		accordionGroup = container.add('Globals');		
		networkMap.each(this.parameters, function(option, key){
			accordionGroup.appendChild(new networkMap.widget.IntegerInput(option.label, properties.get(key, true), option)
				.addEvent('change', changeHandler(key, properties))
			);
		}.bind(this));		
		
		
		
		var linkTemplate = {
			id: {
				label: 'Node',
				type: 'text',
				disabled: true,
				global: false
			},
			name: {
				label: 'Interface',
				type: 'text',
				disabled: true,
				global: false
			}, 
			width: {
				label: 'Width',
				type: 'number',
				min: 0,
				global: false
			}
		};		

		
		var sublinkConf = function(label, node){
			accordionGroup = container.add(label);
			networkMap.each(linkTemplate, function(option, key){
				if (['id'].some(function(item){ return item == key;})){
					accordionGroup.appendChild(new networkMap.widget.TextInput(option.label, properties.get(node + '.' + key), option).addEvent('change', changeHandler(key, link.properties)));
				}
				else{
					if (option.type === 'number'){
						accordionGroup.appendChild(
							new networkMap.widget.IntegerInput(
								option.label, 
								link.path.nodeA.properties.get(key, true), 
								option
							)
							.addEvent('change', changeHandler(key, link.path[node].properties))
						);
					}
					else if(option.type === 'text'){
						accordionGroup.appendChild(
							new networkMap.widget.TextInput(
								option.label, 
								link.path.nodeA.properties.get(key), 
								option
							)
							.addEvent('change', changeHandler(key, link.path[node].properties))
						);
					}
					else if(option.type === 'color'){
						accordionGroup.appendChild(
							new networkMap.widget.ColorInput(
								option.label, 
								link.path.nodeA.properties.get(key), 
								option
							)
							.addEvent('change', changeHandler(key, link.path[node].properties))
						);
					}
				}
			}.bind(this));
		}.bind(this);
		
		sublinkConf('Node A', 'nodeA');
		sublinkConf('Node B', 'nodeB');
		

		
		// Add sublinks
		var sublinkList;
		if (link.subpath.nodeA && link.subpath.nodeB && link.subpath.nodeA.length === link.subpath.nodeB.length) {
			accordionGroup = container.add('Sublinks');
			sublinkList = new networkMap.widget.List();
			link.subpath.nodeA.forEach(function(subpath, index){
				sublinkList.add(subpath.properties.get('name') + ' - ' + link.subpath.nodeB[index].properties.get('name'), {enableDelete: false});
			});
			accordionGroup.appendChild(sublinkList);
		}
		else{ // Asymetric link
			if (link.subpath.nodeA || link.subpath.nodeB){
				accordionGroup = container.add('Sublinks');
				sublinkList = new networkMap.widget.List();
			}

			if (link.subpath.nodeA){
				link.subpath.nodeA.forEach(function(subpath, index){
					sublinkList.add(subpath.properties.get('name') + ' - ' + 'N/A', {enableDelete: false});
				});
			}

			if (link.subpath.nodeB){
				link.subpath.nodeB.forEach(function(subpath, index){
					sublinkList.add('N/A' + ' - ' + subpath.properties.get('name'), {enableDelete: false});
				});
			}

			if (link.subpath.nodeA || link.subpath.nodeB){
				accordionGroup.appendChild(sublinkList);
			}
		}
		
		return container;
	}
});