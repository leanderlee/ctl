
module.exports = async function (log, metainfo, models, disableTests) {
  if (!metainfo) return;
  let state;
  const load = async () => metainfo.get();
  const save = async () => metainfo.set(state);

  async function update(name, version) {
    state.updated = new Date().toISOString();
    state.versions[name] = version;
    await save();
    return version;
  }

  async function setup(name, model) {
    const { setup, version = 0, changes = [] } = model;
    if (setup) await setup();
    return update(name, version + changes.length);
  }

  async function test(name, model) {
    if (!model.testing) return false;
    const { version = -1, perform, reset } = model.testing;
    if (reset) return update(name, -1);
    if (isNaN(version)) return false;
    if (perform) await perform();
    return update(name, version);
  }

  async function upgrade(from, name, model) {
    const { version, changes } = model;
    for (let i = from - version; i < changes.length; i += 1) {
      const change = changes[i];
      if (change) await change();
      await update(name, version + i + 1);
      log.info('Model "%s" upgraded to v%d.', name, version + i + 1);
    }
  }

  async function migrate(name, model) {
    let old = state.versions[name];
    const { testing, version = 0, changes = [] } = model;
    const latest = version + changes.length;
    if (!disableTests) {
      const result = await test(name, model);
      if (result !== false) {
        old = result;
        if (old < 0) {
          log.info('Unset "%s" version.', name);
        } else {
          log.info('Forced "%s" to v%d.', name, old);
        }
      }
    }
    if (old === undefined || old < 0) {
      old = await setup(name, model);
      log.info('Initialized "%s" to v%d.', name, old);
    }
    if (old < latest) {
      if (old < version) throw new Error(`db_version_too_old, must be at least ${version}.`);
      log.info('Model "%s" needs upgrade (v%d -> v%d).', name, old, latest);
      await upgrade(old, name, model);
    }
  }

  // Procedure
  state = await load();
  if (!state || !state.updated) {
    state = {
      updated: new Date().toISOString(),
      versions: {},
    };
  }
  const names = Object.keys(models);
  for (let i = 0; i < names.length; i += 1) {
    const name = names[i];
    await migrate(name, models[name]);
    log.info('Loaded "%s" (v%d).', name, state.versions[name]);
  }
}
