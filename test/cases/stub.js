// Stub to make sure that the required callbacks are called by exit-hook

var c = 0;
var noCallback = true;

// Increment the called count
exports.called = function() {
	c++;
};

// Exit with error
exports.reject = function(s, code) {
	process.stdout.write('FAILURE: ' + s);
	process.exit(code != null ? code : 1);
};

// Exit with success
exports.done = function() {
	process.stdout.write('SUCCESS');
	process.exit(0);
};

// Add the exit check with a specific expected called count
exports.addCheck = function(num) {
	noCallback = false;

	// Only call exit once, and save uncaught errors
	var called = false;
	var ucErr;

	// Save errors that do not start with 'test'
	process.on('uncaughtException', function(err) {
		if (err.message.indexOf('test') !== 0) {
			ucErr = err;
		}
	});

	// Check that there were no unexpected errors and all callbacks were called
	process.once('exit', function() {
		if (called) {
			return;
		}
		called = true;

		if (ucErr) {
			exports.reject(ucErr.stack);
		} else if (c !== num) {
			exports.reject('Expected ' + num + ' callback calls, but ' + c + ' received');
		} else {
			exports.done();
		}
	});
};

// If the check isn't added, throw on exit
process.once('exit', function() {
	if (noCallback) {
		exports.reject('FAILURE, CHECK NOT ADDED');
	}
});
