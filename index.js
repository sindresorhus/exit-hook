'use strict';

var cbs = [];
var errCbs = [];
var called = false;
var waitingFor = 0;
var asyncTimeoutMs = 10000;

function exit(exit, signal, err) {
	// Only execute hooks once
	if (called) {
		return;
	}

	called = true;

	// Run hooks
	if (err) {
		// Uncaught exception, run error hooks
		errCbs.map(runHook.bind(null, 1, err));
	}
	cbs.map(runHook.bind(null, 0, null));

	if (!waitingFor) {
		// No asynchronous hooks, exit immediately
		doExit();
	} else {
		// Force exit after x ms (10000 by default), even if async ops in progress
		setTimeout(function() {
			doExit();
		}, asyncTimeoutMs);
	}

	// Runs a single hook
	function runHook(syncArgCount, err, hook) {
		// cannot perform async hooks in `exit` event
		if (exit && hook.length > syncArgCount) {
			// hook is async, expects a finish callback
			waitingFor++;

			if (err) {
				// Pass error, calling uncaught exception handlers
				return hook(err, stepTowardExit);
			}
			return hook(stepTowardExit);
		}

		// hook is synchronous
		if (err) {
			// Pass error, calling uncaught exception handlers
			return hook(err);
		}
		return hook();
	}

	// Async hook callback, decrements waiting counter
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

		if (exit === true) {
			// All handlers should be called even if the exit-hook handler was registered first
			process.nextTick(process.exit.bind(128 + signal));
		}
	}
}

// Add a hook
function add(cb) {
	cbs.push(cb);

	if (cbs.length === 1) {
		process.once('exit', exit);
		process.once('beforeExit', exit.bind(null, true, -128));
		process.once('SIGHUP', exit.bind(null, true, 1));
		process.once('SIGINT', exit.bind(null, true, 2));
		process.once('SIGTERM', exit.bind(null, true, 15));
	}
}

// Add an uncaught exception handler
add.uncaughtExceptionHandler = function(cb) {
	errCbs.push(cb);

	if (errCbs.length === 1) {
		process.once('uncaughtException', exit.bind(null, true, -127));
	}
};

// Configure async force exit timeout
add.asyncTimeout = function(ms) {
	asyncTimeoutMs = ms;
};

// Export
module.exports = add;
