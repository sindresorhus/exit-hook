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

stub.addCheck(3);
