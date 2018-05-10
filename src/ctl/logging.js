const logs = require('better-logs');

const log = logs('logging');

log.mode('silent', { showByDefault: false });
log.mode('quiet', { showByDefault: true, hide: ['info', 'debug'] });
log.mode('normal', { showByDefault: true, hide: ['debug'] });
log.mode('verbose', { showByDefault: true });
log.overrideConsole();

module.exports = logs;
