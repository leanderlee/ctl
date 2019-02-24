const http = require('http');
const express = require('express');
const nunjucks = require('nunjucks');
const compress = require('compression');
const body = require('body-parser');

function create({ staticUrl, dirs, host, views, debug, log } = {}) {
  const locals = { host, staticUrl };
  const app = express();
  app.set('x-powered-by', false);
  if (staticUrl.startsWith('/')) {
    app.use(staticUrl, express.static(dirs.static));
  }
  app.use(compress());
  app.use(body.json({ limit: '25mb' }));
  app.use(log.morgan());
  app.set('view engine', 'html');
  const env = nunjucks.configure(dirs.views, {
    express: app,
    noCache: !!debug,
  });
  app.use((req, res, next) => {
    res.locals = locals;
    next();
  });

  app.views = {
    render: (view, overrides) => {
      const vars = Object.assign({}, locals, overrides);
      return env.render(view, vars);
    },
  };
  return app;
}

async function run({ app, port, host, log }) {
  const server = http.createServer(app);
  await server.listen(port, host);
  const realHost = server.address().address;
  log.info('Server started listening at http://%s:%s', realHost, port);
}

module.exports = {
  create,
  run,
};
