'use strict';
var test = require('ava');
var exitHook = require('./../');

test(function (t) {
	t.plan(2);

	exitHook(function () {
		t.assert(true);
	});

	exitHook(function () {
		t.assert(true);
	});

	process.exit();
});
