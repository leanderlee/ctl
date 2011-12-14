
var Request = function (kwargs) {
	var self = this;
  kwargs = kwargs || {};
  

  // Private properties
  var res = kwargs.res;
  var req = kwargs.req;


  // Public properties
  self.defaults = kwargs.defaults || {};


	// Public methods
	self.protect = function () {
		if (req.session.authenticated) {
			if (typeof(page) == 'function') {
				page.call(null);
			} else {
				this.render(res, page, params);
			}
		} else {
			this.render(res, defaults.login);
		}
	}
	self.headers = function () {
		return req.headers;
	}
	self.accepts = function (mime) {
		return (req.headers.accept.indexOf(mime) >= 0);
	}
	self.set = function (name, value) {
		req.session[name] = value;
	}
	self.get = function (name) {
		return req.session && req.session[name];
	}
	self.param = function (name, def) {
		return req.param(name, def || '');
	}
	self.redirect = function (url) {
		res.writeHead(302, { 'Location': url });
		res.end();
	}
	self.json = function (obj) {
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(obj));
	}
	self.write = function (str) {
		res.end(str);
	}
	self.render = function (template, params) {
		params = params || {};
		for (var i in defaults) {
			if (params[i] == undefined) {
				params[i] = defaults[i];
			}
		}
		res.render(template, params);
	}
	
	return self;
};


var Host = function (makeRequest) {
	var self = this;


	// Private properties
	var bindings = {};


	// Private methods
	var serveOn = function (server, url, controller) {
		controller = controller || {};
		if (typeof(controller['get']) == 'function') {
			server.get(url, function () {
				var page = makeRequest.apply(null, arguments);
				controller['get'].call(null, page);
			});
		}
		if (controller['post']) {
			server.post(url, function () {
        var page = makeRequest.apply(null, arguments);
				controller['post'].call(null, page);
			});
		}
		if (controller['put']) {
			server.put(url, function () {
        var page = makeRequest.apply(null, arguments);
				controller['put'].call(null, page);
			});
		}
		if (controller['del']) {
			server.del(url, function () {
        var page = makeRequest.apply(null, arguments);
				controller['del'].call(null, page);
			});
		}
		if (controller['delete']) {
			server.del(url, function (req, res) {
        var page = makeRequest.apply(null, arguments);
				controller['delete'].call(null, page);
			});
		}
		if (controller['all']) {
			server.all(url, function (req, res) {
        var page = makeRequest.apply(null, arguments);
				controller['all'].call(null, page);
			});
		}
		if (typeof(controller) == 'function') {
			server.all(url, function (req, res) {
        var page = makeRequest.apply(null, arguments);
				controller.call(null, page);
			});
		}
	}

	// Public methods
	self.bind = function (url, controller) {
		bindings[url] = controller;
	}
	self.serve = function (server) {
		for (var url in bindings) {
			serveOn(server, url, bindings[url]);
		}
	}
	
	return self;
};


exports.ctl = function (options, mr) {
	options = options || {};

	mr = mr || function () {
    var kwargs = {
      req: arguments[0] || null,
      res: arguments[1] || null,
      defaults: options,
    };
		return Request(kwargs);
	};

	return new Host(mr);
};
