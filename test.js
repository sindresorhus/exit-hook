'use strict';
var test = require('ava');
var exitHook = require('./');

test(function (t) {
	t.plan(1);

	exitHook(function () {
		t.assert(true);
	});

	process.exit();
});
