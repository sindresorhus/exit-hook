'use strict';

var cbs = [];
var called = false;
var waitingFor = 0;
var forceTimeout = null;

function exit(exit, signal) {
	if (called) {
		return;
	}

	called = true;

	cbs.forEach(function (el) {
		// can only perform async ops on SIGINT/SIGTERM
		if (exit && el.length) {
			// el expects a callback
			waitingFor++;

			el(stepTowardExit);
		}
		else {
			el();
		}
	});

	if (!waitingFor) {
		doExit();
	} else {
		// Timeout to force exit after 10 seconds
		forceTimeout = setTimeout(function() {
			doExit();
		}, 10000);
	}

	function stepTowardExit() {
		process.nextTick(function() {
			if (--waitingFor === 0) {
				doExit();
			}
		});
	}

	var doExitDone = false;
	function doExit() {
		if (doExitDone) {
			return;
		}
		doExitDone = true;
		clearTimeout(forceTimeout);

		if (exit === true) {
			process.exit(128 + signal);
		}
	}
}

module.exports = function (cb) {
	cbs.push(cb);

	if (cbs.length === 1) {
		process.once('exit', exit);
		process.once('beforeExit', exit.bind(null, true, -128));
		process.once('SIGHUP', exit.bind(null, true, 1));
		process.once('SIGINT', exit.bind(null, true, 2));
		process.once('SIGTERM', exit.bind(null, true, 15));
	}
};
