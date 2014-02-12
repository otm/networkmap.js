networkMap.widget = networkMap.widget || {};

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
});