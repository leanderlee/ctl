# ctl

`ctl` is a lightweight framework to manage code for node servers. Tried and tested in production.

## Features

- Stage setup
- Config (secret) management
- Logging out of the box
- Run any service, (we use express out of the box)
- Organize your Node.JS server code quickly

## Installation

```bash
yarn add ctl
```

## Stage, Config and Logging

```js
const stage = ctl.stage();
const config = ctl.config();
const log = ctl.log('section');
```

#### Stage

Most servers need an environment flag, like `local`, `staging` or `prod`. You can do this easily by setting the `STAGE` environment variable, and running the server like `STAGE=local node index.js`. This will then be read into ctl.stage().

#### Config

Config also works out of the box, and ctl will look from a variety of places and merge the configs. Here are all the places it will look:

- {SRC}/library/defaults.js
- {ROOT}/defaults.json
- {ROOT}/defaults.js
- {SRC}/library/defaults-{STAGE}.js
- {ROOT}/defaults-{STAGE}.json
- {ROOT}/defaults-{STAGE}.js
- {SRC}/library/config.js
- {ROOT}/config.json
- {ROOT}/config.js
- {SRC}/library/config-{STAGE}.js
- {ROOT}/config-{STAGE}.json
- {ROOT}/config-{STAGE}.js

Note: ROOT is the home directory, and SRC is the src directory (defaults to /src), see in [options](#options)

As you can see, it will load the right config in based on the STAGE you set.

#### Logging

Please refer to the documentation for [better-logs](https://github.com/diamondio/better-logs)

## Lifecycle

Lifecycles are events you can implement to run at different stages of the server starting. You can put them in `src/lifecycle` folder, like `src/lifecycle/after.js`, or you can set in these as async functions and pass it in to the options or from the config.

- *before* - Before the server starts, but after the config loads. Great place to connect to the DB, load models, etc.
- *startup* - Good for setting up routes/handlers, before the server listens for requests.
- *after* - After the service has started

## Options

Here are the valid options you can pass to `init`:

- *service* - defaults to an express service, but can be any server or script. (See [service][#Service] for more info.)
- *src* - where to look for the root of source code (defaults to /src)
- *lifecycle* - where to look for lifecycle files (defaults to /lifecycle)

## Service

By default, ctl comes with an express server so you can get started quickly. It uses nunjucks and can host static files, and you can expand on it further in the `startup` part of your lifecycle before the server begins listening.

You can also write your own service, it's really easy. A service is just an object with two functions, `create(ctl)` and `run(app, ctl)`. You can pass this to the options in `init` or define it in the config.

- *create(ctl)* - returns an app object that will be passed to `run`.
- *run(app, ctl)* - runs the app

## More Information ##

The first version of ctl, way back in 2010, was built primarily as a way to manage controllers and handle server requests consistently. But with the advent of `async`/`await`, it's much easier to write logic nowadays. The goal of ctl, as it has always been, is to reduce the amount of time it takes you to get up and running with a full on, system that's ready to scale. That way you focus on building the project and validating the idea, and not on inconsequential things like how to structure your code/server.


## Contact & Licensing ##

Feel free to use this for whatever you like, but don't blame me if someone loses an eye.

If you are using this, I'd love to hear about your project. It's great to know my code is being used somewhere by someone.

[Leander Lee][1]<br />
me@leander.ca

[1]: http://leander.ca











