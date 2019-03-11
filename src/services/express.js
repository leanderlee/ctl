const http = require('http');
const express = require('express');
const nunjucks = require('nunjucks');
const compress = require('compression');
const body = require('body-parser');

function create(ctl) {
  const log = ctl.log('server');
  const config = ctl.config();
  const app = express();
  app.set('x-powered-by', false);
  if (config.server.static.startsWith('/')) {
    app.use(config.server.static, express.static(ctl.dirs.static));
  }
  app.use(compress());
  app.use(body.json({ limit: '25mb' }));
  app.use(log.morgan());
  app.set('view engine', 'html');
  const env = nunjucks.configure(ctl.dirs.views, {
    express: app,
    noCache: (ctl.stage !== 'production'),
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

async function run({ app, port, host, log }) {
  const server = http.createServer(app);
  await server.listen(port, host);
  const realHost = server.address().address;
  const realPort = server.address().port;
  log.info('Server started listening at http://%s:%s', realHost, realPort);
}

module.exports = {
  create,
  run,
};
