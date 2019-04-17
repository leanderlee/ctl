const mods = require('app-module-path');
const path = require('path');
const merge = require('lodash.merge');
const fs = require('fs-extra');

const express = require('./services/express');

const CORE_PLUGINS = {
  stage: require('./plugins/stage'),
  log: require('./plugins/log'),
  config: require('./plugins/config'),
};
const DEFAULTS = {
  autoStart: true,
  service: express,
  script: '',
  src: '/src',
  lifecycle: '/lifecycle',
};

module.exports = class Service {
  async init(opts = {}) {
    this.options = merge(DEFAULTS, opts);
    await this.loadCore();
    const config = this.config();
    const service = config.service || this.options.service;
    if (config.plugins) {
      await this.loadPlugins(config.plugins);
    }
    this.setLifecycle(config.lifecycle || this.options.lifecycle);
    await this.run('before');
    const app = service.create(this);
    await this.run('startup', app);
    if (this.options.autoStart || config.autoStart === false) {
      await this.start(service, app);
      return true;
    }
    return (async () => this.start(service, app));
  }
  async run(event, ...args) {
    if (this.lifecycle[event]) {
      await this.lifecycle[event](...args);
    }
  }
  async loadCore() {
    this.setDirs();
    this.setModulePath();
    await this.loadPlugins(CORE_PLUGINS);
  }
  async start(service, app) {
    service.start(app, this);
    await this.run('after', app);
  }
  setDirs() {
    const root = this.options.root || process.cwd();
    const src = `${root}${this.options.src}`;
    this.dirs = { root, src };
  }
  setModulePath() {
    mods.addPath(this.dirs.src);
  }
  setLifecycle(lc) {
    if (!lc) throw new Error('missing_lifecycle');
    if (typeof lc === 'object') {
      this.lifecycle = {
        before: lc.before || (async () => {}),
        startup: lc.startup || (async () => {}),
        after: lc.after || (async () => {}),
      };
      return true;
    }
    if (typeof lc === 'string') {
      const lcDir = `${this.dirs.src}${lc}`;
      this.lifecycle = {
        before: this.loadLifecycleFile(lcDir, 'before'),
        startup: this.loadLifecycleFile(lcDir, 'startup'),
        after: this.loadLifecycleFile(lcDir, 'after'),
      };
    }
  }
  loadLifecycleFile(dir, evt) {
    const log = this.log('lifecycle');
    const file = path.resolve(`${dir}/${evt}.js`);
    const exists = fs.existsSync(file);
    if (!exists) return log.warn('Missing lifecycle event:', evt, file);
    return require(file);
  }
  async loadPlugins(pluginMap) {
    const plugins = Object.keys(pluginMap);
    for (let i = 0; i < plugins.length; i += 1) {
      const name = plugins[i];
      const plugin = pluginMap[name];
      if (this[name]) throw new Error(`plugin_${name}_already_declared`);
      this[name] = await plugin(this);
    }
  }
}
