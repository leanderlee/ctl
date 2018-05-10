const callsite = require('callsite');
const path = require('path');
const fs = require('fs-extra');
const merge = require('lodash.merge');
const paths = require('app-module-path');

const utils = require('./src/utils');
const migrate = require('./src/migrate');

const settings = {
  init: false,
  root: '',
  src: '/src',
  library: 'library',
  models: '/models',
  config: 'config',
  logging: 'logging',
  lifecycle: 'lifecycle',
  service: 'service',
  metainfo: 'metainfo',
};

function library(name, optional) {
  try {
    return require(`${settings.library}/${name}`);
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND' || e.message.indexOf(`${settings.library}/${name}`) === -1) {
      throw e;
    }
  }
  if (settings.library !== 'ctl') {
    try {
      return require(`ctl/${name}`);
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND' || e.message.indexOf(`ctl/${name}`) === -1) {
        throw e;
      }
    }
  }
  if (!optional) throw new Error(`missing_library_${name}`);
}

async function loader() {
  const folders = (Array.isArray(settings.models) ? settings.models : [settings.models]);
  const models = {};
  for (let i = 0; i < folders.length; i += 1) {
    const folder = utils.addSlash(folders[i], '');
    const dir = `${settings.src}${folder}`;
    let contents = [];
    try {
      contents = await fs.readdir(dir);
    } catch (e) {
      if (e.code !== 'ENOENT' || folder !== '/models') throw e;
    }
    for (let j = 0; j < contents.length; j += 1) {
      const ext = path.extname(contents[j]);
      if (ext !== '.js') continue;
      const name = path.basename(contents[j], ext);
      if (models[name]) throw new Error(`model_name_declared_${name}`);
      const model = require(`${folder.slice(1)}/${name}${ext}`);
      // TODO: Check it has the relevant functions
      models[name] = model;
    }
  }
  return models;
}

async function init() {
  const log = library(settings.logging)('ctl');
  try {
    const lifecycle = library(settings.lifecycle, true) || {};
    const service = library(settings.service);
    const config = library(settings.config);
    const debug = (config.env === 'local');
    const models = await loader();

    const context = service.create();
    if (lifecycle.loadModels) {
      merge(models, await lifecycle.loadModels(context) || {});
    }
    if (lifecycle.connect) await lifecycle.connect(context);
    if (lifecycle.pre) await lifecycle.pre(context);
    const metainfo = library(settings.metainfo, true);
    await migrate(log, metainfo, models, !debug);
    if (lifecycle.setup) await lifecycle.setup(context);
    await service.run(context);
    if (lifecycle.post) lifecycle.post(context);
  } catch (e) {
    log.error(e);
    process.exit(1);
  }
}

function dirname() {
  const stack = callsite();
  const requester = stack[2].getFileName();
  return path.dirname(requester);
}

function CTL(opts = {}) {
  const src = utils.addSlash(opts.src, '/src');
  opts.root = dirname();
  opts.src = `${opts.root}${src}`;
  merge(settings, opts, { init: true });
  paths.addPath(`${__dirname}/src`);
  paths.addPath(settings.src);
  init();
}

CTL.dirname = dirname;
CTL.library = library;
CTL.settings = (defaults = {}) => merge(defaults, settings);

module.exports = CTL;
