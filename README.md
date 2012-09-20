# NodeCTL #

NodeCTL is an easy way to manage all those routes and ugly handlers in ExpressJS or some other library.

## How it works ##

In the most basic usage, it would be something like this:

server.js
	
	var express = require('express');
	var app = express.createServer();
	app.use(express.bodyParser());
	app.use(express.cookieParser('keyboard cat'));
	app.use(express.session({ cookie: { maxAge: 60000 }}));
	app.use(flash());
	require('./controller.js').route(app);
	app.listen(80);

controller.js

	var host = require('ctl').init();
	exports.route = function (server) {
		host.bind("/", function (page) {
			page.write("hello, world!");
  		});
		host.serve(server);
	}


## Installation ##

`npm install ctl`

Please try it out! If you like it please say thank you. Or better, if you find bugs, have questions, or feedback, feel free to email me at me@leander.ca.


## More Information ##

NodeCTL is really easy to use. The way it works is instead of the normal way of handling all this ugly stuff in `req` and `res`, that stuff is dealt with by a more civilized `Request` object that handles all of that for you (In the example, this object is passed in as `page`). Of course, this object is fully customizable, extendible, and interchangable by yours truly (see Advanced Usage).

The details of the standard `Request` object is listed below for your use and reference.

**require('ctl').init([defaults])** - This function optionally takes defaults as values that are sent to the template engine for rendering (see `render` below).

**defaults** - Is a property holding the object you passed in with `init()`.

**headers()** - Returns all of the headers from the client's request.

**next()** - Goes to the next handler (see express documentation)

**accepts(mimetype)** - Checks to see if `mimetype` is in the `accept` part of the header.

**set(key,val)** - Sets the session variable `key` with value `val`.

**get(key)** - Gets the value of the session variable `key`.

**param(name,default)** - This is used to get the variables from GET, POST or from the URL. Example uses of this is shown in the examples folder.

**redirect(url)** - Pretty straightforward. Redirects (with status 302) to `url`.

**json(obj)** - Responds with `obj` as a json string and ends the request.

**write(str)** - Responds with `str` and ends the request.

**render(tmpl,params)** - Renders the template `tmpl` as you would in ExpressJS, passing in the parameters `params` to the template. Note that you can set some default parameters that will be sent along if they are not specified by render (of course, render can overwrite defaults).


## Advanced Usage ##

The `init` function actually has two parameters. The first being `defaults` and the second being a function that creates the actual request object. This function returns the object `require('ctl').Request` which contains all of the methods listed above. You can change the request object binded by the controller by passing in your own makeRequest function and returning your own controller.

**require('ctl').init([[defaults], makeRequest(req,res)])**

If you are still confused, just read the concise `host.js` file, or ask a question in issues.


## Contact & Licensing ##

Feel free to use this for whatever you like, but don't blame me if someone loses an eye.

If you are using this, I'd love to hear about your project. It's great to know my code is being used somewhere by someone.

[Leander Lee][1]<br />
me@leander.ca

[1]: http://leander.ca











