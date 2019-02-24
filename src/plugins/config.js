const path = require('path');
const config = require('better-config');
const merge = require('lodash.merge');

async function load(ctl, f) {
  const log = ctl.log('config');
  let settings;
  try {
    settings = require(f);
  } catch (e) {}
  if (typeof settings === 'function') {
    config.set(await settings(ctl));
    log.info(`Config "${path.relative(process.cwd(), f)}" executed.`);
  } else if (settings) {
    config.set(settings);
    log.info(`Config "${path.relative(process.cwd(), f)}" loaded.`);
  }
}

module.exports = async (ctl) => {
  const { ENV = 'local', CONFIG = '', PORT = 8080 } = process.env;
  const env = ENV.toLowerCase();
  const log = ctl.log('config');
  ctl.env = env;
  let overrides;
  try {
    overrides = JSON.parse(CONFIG);
  } catch (e) {
    if (CONFIG) throw e;
  }
  config.set({
    env,
    server: {
      port: PORT,
      static: '/static',
      staticUrl: 'http://localhost:8080/static',
      baseUrl: 'http://localhost:8080',
    },
  });
  await load(ctl, `${ctl.dirs.src}/library/defaults`);
  await load(ctl, `${ctl.dirs.root}/defaults.json`);
  await load(ctl, `${ctl.dirs.root}/defaults.js`);
  await load(ctl, `${ctl.dirs.src}/library/defaults-${env}`);
  await load(ctl, `${ctl.dirs.root}/defaults-${env}.json`);
  await load(ctl, `${ctl.dirs.root}/defaults-${env}.js`);
  await load(ctl, `${ctl.dirs.src}/library/config`);
  await load(ctl, `${ctl.dirs.root}/config.json`);
  await load(ctl, `${ctl.dirs.root}/config.js`);
  await load(ctl, `${ctl.dirs.src}/library/config-${env}`);
  await load(ctl, `${ctl.dirs.root}/config-${env}.json`);
  await load(ctl, `${ctl.dirs.root}/config-${env}.js`);
  if (overrides) {
    config.set(overrides);
    log.info('Loaded overrides from environment variables.');
  }
  return () => config;
}
