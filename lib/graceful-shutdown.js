'use strict';

module.exports = function(server, options) {
  if (!server) { throw new TypeError('HTTP(S) server instance expected as fist argument'); }

  function gracefulShutdown() {
    var timeout = options && options.timeout ? options.timeout : 30000,
        logger  = options && options.logger  ? options.logger : console;

    logger.info('[Express] Received kill signal (SIGTERM/SIGINT), shutting down gracefully.');
    server.close(function() {
      logger.info('[Express] Closed out remaining connections.');
      process.exit();
    });

    setTimeout(function() {
      logger.error('[Express] Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, timeout);
  }

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT',  gracefulShutdown);
};
