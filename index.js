'use strict';
module.exports = function (cb) {
	var exit = function (sig) {
		cb();

		if (sig) {
			process.exit(128);
		}
	};

	process.once('exit', exit);
	process.once('SIGINT', exit.bind(null, true));
	process.once('SIGTERM', exit.bind(null, true));
};
