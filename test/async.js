'use strict';
var test = require('ava');
var exitHook = require('./../');

test(function (t) {
	t.plan(3);

	exitHook(function (cb) {
		setTimeout(function() {
			t.assert(true);
			cb();
		}, 50);
		t.assert(true);
	});

	exitHook(function () {
		t.assert(true);
	});

	process.kill(process.pid, 'SIGINT');
});
