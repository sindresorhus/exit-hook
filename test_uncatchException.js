'use strict';
var exitHook = require('./');

exitHook(function () {
	console.log("callback1");
});

exitHook(function () {
	console.log("callback2");
});

exitHook(function () {
	console.log("done");
})

throw new Error('foo exception');
