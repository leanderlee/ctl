const callsite = require('callsite');
const path = require('path');
const fs = require('fs-extra');
const merge = require('lodash.merge');
const paths = require('app-module-path');

const utils = require('./src/utils');
const migrate = require('./src/migrate');

let service;
let metainfo;
const settings = {
  init: false,
  debug: false,
  root: '',
  src: '/src',
  models: '/models',
  logging: 'logging',
  lifecycle: 'lifecycle',
};

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
  const log = require(`library/${settings.logging}`)('ctl');
  try {
    if (!service) throw new Error('Service is not defined, please install ctl-express or some other service.');
    const lifecycle = require(`library/${settings.lifecycle}`, true) || {};
    const debug = !!settings.debug;
    const models = await loader();
    const context = service.create();
    if (lifecycle.loadModels) {
      merge(models, await lifecycle.loadModels(context) || {});
    }
    if (lifecycle.connect) await lifecycle.connect(context);
    if (lifecycle.pre) await lifecycle.pre(context);
    if (metainfo) {
      const handler = await metainfo();
      if (handler) await migrate(log, handler, models, !debug);
    }
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
  if (module.parent) {
    const pkg = require(`${opts.root}/package.json`);
    Object.keys(pkg.dependencies)
      .filter(lib => lib.startsWith('ctl-'))
      .forEach(lib => module.parent.require(lib));
  }
  init();
}

CTL.service = (obj) => {
  if (obj !== undefined) {
    service = obj;
  }
  return service;
};
CTL.metainfo = (obj) => {
  if (obj !== undefined)  {
    metainfo = obj;
  }
  return metainfo;
};
CTL.dirname = dirname;
CTL.settings = (defaults = {}) => merge(defaults, settings);

module.exports = CTL;
