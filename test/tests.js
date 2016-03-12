// Tests have to happen in a subprocess to test the exit functionality
'use strict';

var test = require('ava');
var fork = require('child_process').fork;
var path = require('path');

/**
 * Starts a test file in a subprocess, returns a promise that resolves with the subprocess
 * exit code and output in an array ([code, output])
 *
 * @async
 * @param {String} test Filename without path or extension
 * @return {[Number, String]} Array with the exit code and output of the subprocess
 */
function testInSub(test) {
	return new Promise(resolve => {
		var proc = fork(
			path.resolve(__dirname, './cases/' + test + '.js'),
			{
				env: process.env,
				silent: true
			}
		);

		var output = '';

		proc.stdout.on('data', function(data) {
			output += data.toString();
		});

		proc.stderr.on('data', function(data) {
			output += data.toString();
		});

		proc.on('exit', code => {
			resolve([code, output]);
		});
	});
}

test('sync handlers', t => {
	t.plan(2);
	return testInSub('sync')
		.then(([code, output]) => {
			t.is(output, 'SUCCESS');
			t.is(code, 0);
		});
});

test('async handlers', t => {
	t.plan(2);
	return testInSub('async')
		.then(([code, output]) => {
			t.is(output, 'SUCCESS');
			t.is(code, 0);
		});
});

test('async uncaught exception handler', t => {
	t.plan(2);
	return testInSub('asyncErr')
		.then(([code, output]) => {
			t.is(output, 'SUCCESS');
			t.is(code, 0);
		});
});

test('async exit timeout', t => {
	t.plan(2);
	return testInSub('asyncExitTimeout')
		.then(([code, output]) => {
			t.is(output, 'SUCCESS');
			t.is(code, 0);
		});
});
