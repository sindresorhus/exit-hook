'use strict';

var cbs = [];

function exit(sig) {
	cbs.forEach(function (el) {
		el();
	});

	if (sig) {
		process.exit(128);
	}
};

module.exports = function (cb) {
	cbs.push(cb);

	if (cbs.length === 1) {
		process.once('exit', exit);
		process.once('SIGINT', exit.bind(null, true));
		process.once('SIGTERM', exit.bind(null, true));
	}
};
