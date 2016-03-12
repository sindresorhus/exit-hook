'use strict';
var stub = require('./stub');
var exitHook = require('./../../index');

exitHook(function () {
	stub.called();
});

exitHook(function () {
	stub.called();
});

process.on('exit', function() {
	stub.called();
});

stub.addCheck(3);
