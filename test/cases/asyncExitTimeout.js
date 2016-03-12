'use strict';
var exitHook = require('./../../index');
var stub = require('./stub');

exitHook(function(cb) {
	setTimeout(function() {
		stub.called();
		cb();
	}, 2000);
	stub.called();
});

exitHook(function() {
	stub.called();
});

exitHook.uncaughtExceptionHandler(function(err, cb) {
	setTimeout(function() {
		stub.called();
		cb();
	}, 2000);
	stub.called();
});

exitHook.forceExitTimeout(500);
stub.addCheck(3);

throw new Error('test');
