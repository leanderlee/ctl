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
    config.set(await settings(config));
    ctl.stage(config.stage);
    log.info(`Config "${path.relative(process.cwd(), f)}" executed.`);
  } else if (settings) {
    config.set(settings);
    ctl.stage(config.stage);
    log.info(`Config "${path.relative(process.cwd(), f)}" loaded.`);
  }
}

module.exports = async (ctl) => {
  const { CONFIG = '', PORT = 8080, SCRIPT = '' } = process.env;
  const log = ctl.log('config');
  let overrides;
  try {
    overrides = JSON.parse(CONFIG);
  } catch (e) {
    if (CONFIG) throw e;
  }
  config.set({
    stage: ctl.stage(),
    script: SCRIPT,
    server: {
      port: PORT,
      static: '/static',
      staticUrl: 'http://localhost:8080/static',
      baseUrl: 'http://localhost:8080',
    },
  });
  config.set(ctl.options.defaults, true);
  config.set(ctl.options.config, true);
  await load(ctl, `${ctl.dirs.src}/library/defaults`);
  await load(ctl, `${ctl.dirs.root}/defaults.json`);
  await load(ctl, `${ctl.dirs.root}/defaults.js`);
  await load(ctl, `${ctl.dirs.src}/library/defaults-${ctl.stage()}`);
  await load(ctl, `${ctl.dirs.root}/defaults-${ctl.stage()}.json`);
  await load(ctl, `${ctl.dirs.root}/defaults-${ctl.stage()}.js`);
  await load(ctl, `${ctl.dirs.src}/library/config`);
  await load(ctl, `${ctl.dirs.root}/config.json`);
  await load(ctl, `${ctl.dirs.root}/config.js`);
  await load(ctl, `${ctl.dirs.src}/library/config-${ctl.stage()}`);
  await load(ctl, `${ctl.dirs.root}/config-${ctl.stage()}.json`);
  await load(ctl, `${ctl.dirs.root}/config-${ctl.stage()}.js`);
  if (overrides) {
    config.set(overrides);
    log.info('Loaded overrides from environment variables.');
  }
  log.info(`Loaded config for "${ctl.stage()}".`);
  return () => config;
}
