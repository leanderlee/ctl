const http = require('http');
const express = require('express');
const nunjucks = require('nunjucks');
const compress = require('compression');
const body = require('body-parser');

function create(ctl) {
  const config = ctl.config();
  const log = ctl.log('server');
  const app = express();
  app.set('x-powered-by', false);
  if (config.server.static) {
    app.use(config.server.static, express.static(config.server.staticDir));
  }
  app.use(compress());
  app.use(body.json({ limit: '25mb' }));
  app.use(log.morgan());
  app.set('view engine', 'html');
  const env = nunjucks.configure(config.server.viewsDir, {
    express: app,
    noCache: (ctl.stage() !== 'production'),
  });

  app.views = {
    render: (view, overrides) => {
      const vars = Object.assign({}, locals, overrides);
      return env.render(view, vars);
    },
  };
  app.use((req, res, next) => {
    res.locals.staticUrl = config.server.staticUrl;
    res.locals.baseUrl = config.server.baseUrl;
    next();
  });
  return app;
}

async function start(app, ctl) {
  const config = ctl.config();
  const log = ctl.log('server');
  const { port, host } = config.server;
  const server = http.createServer(app);
  server.on('listening', () => {
    const addr = server.address();
    let realHost = '<unknown-host>';
    let realPort = '<unknown-port>';
    if (addr) {
      realHost = addr.address;
      realPort = addr.port;
    }
    log.info('Server started listening at http://%s:%s', realHost, realPort);
  });
  await server.listen(port, host);
}

module.exports = {
  create,
  start,
};
