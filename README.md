# ctl

ctl is the easiest way to manage everything with a project. specifically, it offers an opinionated framework for:

- config (secret) management
- easy db migration/model management
- routes and handlers
- html pages, styles and views
- static assets


## Installation ##

```bash
yarn add ctl
```

Then to start a server, all you need to do is:

```bash
node -e 'require("ctl")()'
```

You can put this in the package.json like so:

```json
{
  ...
  "scripts": {
    "start": "node -e 'require(\"ctl\")()'"
  }
}
```

And now you can run `yarn start` to start the server.


Please try it out! If you like it please say thank you. Or better, if you find bugs, have questions, or feedback, feel free to email me at me@leander.ca.


## Libraries ##

```js
const config = require('library/config');
const log = require('library/logging')('section');
```

## Lifecycle ##

// load
// connect
// pre
// migration
// setup
// start/serve
// post

## Advanced ##

Passing in options

Valid options:

- *src* - where to look for the root of source code (defaults to /src)
- *models* - where to look for models (defaults to /models folder in src)

## More Information ##

The first version of ctl, way back in 2010, was built primarily as a way to manage controllers and handle server requests consistently. But with the advent of `async`/`await`, it's much easier to write logic nowadays. The goal of ctl, as it has always been, is to reduce the amount of time it takes you to get up and running with a full on, legit system that's ready to scale. That way you focus on building the project and validating the idea, and not on inconsequential things like how to structure your code/server.


## Contact & Licensing ##

Feel free to use this for whatever you like, but don't blame me if someone loses an eye.

If you are using this, I'd love to hear about your project. It's great to know my code is being used somewhere by someone.

[Leander Lee][1]<br />
me@leander.ca

[1]: http://leander.ca











