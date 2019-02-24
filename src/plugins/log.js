
module.exports = async (ctl) => {
  return ctl.options.logger || require('better-logs');
}
