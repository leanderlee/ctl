
function defaultValue(val, def) {
  if (val === undefined) {
    return def;
  }
  return val;
}

function preSlash(dir) {
  if (dir && !dir.startsWith('/')) {
    return `/${dir}`;
  }
  return dir;
}

exports.addSlash = function (dir, def) {
  return preSlash(defaultValue(dir, def));
};

