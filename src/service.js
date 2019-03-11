const mods = require('app-module-path');
const path = require('path');
const merge = require('lodash.merge');
const fs = require('fs-extra');

const express = require('./services/express');

const DEFAULTS = {
  plugins: {
    stage: require('./plugins/stage'),
    log: require('./plugins/log'),
    config: require('./plugins/config'),
  },
  autoStart: true,
  service: express,
  script: '',
  src: '/src',
  controllers: '/controllers',
  lifecycle: '/lifecycle',
  views: '/views',
  models: '/models',
  static: '/static',
  staticUrl: '/static',
};

module.exports = class Service {
  async init(opts = {}) {
    this.setOptions(opts);
    this.setDirs();
    this.setModulePath();
    await this.setupPlugins();
    await this.runLifecycleEvent('before');
    await this.loadModels();
    await this.run();
    return this;
  }
  async run() {
    const config = this.config();
    if (config.script) {
      await this.runScript(config.script);
      if (config.scriptOnly) {
        process.exit(0);
      }
    }
    await this.runServer();
  }
  async runServer() {
    this.setupServer();
    await this.runLifecycleEvent('startup');
    await this.setupRoutes();
    if (this.options.autoStart) {
      await this.startServer();
    }
  }
  async runScript(file) {
    const log = this.log('script');
    const script = path.resolve(`${this.dirs.root}/${file}`);
    const relative = path.relative(process.cwd(), script);
    log.info(`Running "${relative}" script...`);
    const fn = require(script);
    await fn();
    log.info(`Finished running "${relative}".`);
  }
  setOptions(opts) {
    this.options = merge(DEFAULTS, opts);
  }
  setModulePath() {
    mods.addPath(this.dirs.src);
  }
  setDirs() {
    const root = this.options.root || process.cwd();
    const src = `${root}${this.options.src}`;
    this.dirs = {
      root, src,
      lifecycle: `${src}${this.options.lifecycle}`,
      controllers: `${src}${this.options.controllers}`,
      models: `${src}${this.options.models}`,
      views: `${src}${this.options.views}`,
      static: `${src}${this.options.static}`,
    }
  }
  async runLifecycleEvent(evt) {
    const log = this.log('lifecycle');
    const file = path.resolve(`${this.dirs.lifecycle}/${evt}.js`);
    const exists = fs.existsSync(file);
    if (!exists) return log.warn('Missing lifecycle event:', evt, file);
    try {
      const fn = require(file);
      await fn();
    } catch (e) {
      log.error('FATAL:', evt, e);
      process.exit(1);
    }
  }
  async startServer() {
    const config = this.config();
    this.server = await this.options.service.run({
      app: this.app,
      port: config.server.port,
      host: config.server.host,
      log: this.log('server'),
    });
    await this.runLifecycleEvent('after');
  }
  async loadModels() {
    let contents = [];
    try {
      contents = await fs.readdir(this.dirs.models);
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
    for (let j = 0; j < contents.length; j += 1) {
      const ext = path.extname(contents[j]);
      if (ext !== '.js') continue;
      const file = path.resolve(`${this.dirs.models}/${contents[j]}`);
      const model = require(file);
      if (model.load) {
        await model.load();
      }
    }
  }
  setupServer() {
    this.app = this.options.service.create(this);
  }
  async setupRoutes() {
    let contents = [];
    try {
      contents = await fs.readdir(this.dirs.controllers);
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
    for (let j = 0; j < contents.length; j += 1) {
      const ext = path.extname(contents[j]);
      if (ext !== '.js') continue;
      const file = path.resolve(`${this.dirs.controllers}/${contents[j]}`);
      const ctl = require(file);
      if (ctl.bind) {
        await ctl.bind(this.app);
      }
    }
  }
  async setupPlugins() {
    const log = require('better-logs')('plugins');
    const plugins = Object.keys(this.options.plugins);
    for (let i = 0; i < plugins.length; i += 1) {
      const name = plugins[i];
      const plugin = this.options.plugins[name];
      if (this[name]) throw new Error(`plugin_${name}_already_declared`);
      this[name] = await plugin(this);
    }
  }
}
