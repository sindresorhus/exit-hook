'use strict';
var exitHook = require('./../../index');
var stub = require('./stub');

exitHook(function(cb) {
	setTimeout(function() {
		stub.called();
		cb();
	}, 50);
	stub.called();
});

exitHook(function() {
	stub.called();
});

exitHook.uncaughtExceptionHandler(function(err, cb) {
	setTimeout(function() {
		stub.called();
		cb();
	}, 50);
	if (!err || err.message !== 'test') {
		stub.reject('No error passed to uncaughtExceptionHandler, or message not test - ');
	}
	stub.called();
});

process.on('uncaughtException', function() {
	// All uncaught exception handlers should be called even though the exit hook handler was registered
	stub.called();
});

stub.addCheck(6);

throw new Error('test');
