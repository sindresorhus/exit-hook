'use strict';

const callbacks = new Set();
let isCalled = false;
let isRegistered = false;

function exit(exit, signal) {
	if (isCalled) {
		return;
	}

	isCalled = true;

	const maybeExit = () => {
		if (exit === true) {
			process.exit(128 + signal); // eslint-disable-line unicorn/no-process-exit
		}
	};

	Promise.all(Array.from(callbacks).map(fn => fn())).then(maybeExit); // eslint-disable-line unicorn/prefer-spread
	setTimeout(maybeExit, 15000).unref();
}

module.exports = callback => {
	callbacks.add(callback);

	if (!isRegistered) {
		isRegistered = true;

		process.once('exit', exit);
		process.once('SIGINT', exit.bind(null, true, 2));
		process.once('SIGTERM', exit.bind(null, true, 15));

		// PM2 Cluster shutdown message. Caught to support async handlers with pm2, needed because
		// explicitly calling process.exit() doesn't trigger the beforeExit event, and the exit
		// event cannot support async handlers, since the event loop is never called after it.
		process.on('message', message => {
			if (message === 'shutdown') {
				exit(true, -128);
			}
		});
	}

	return () => {
		callbacks.delete(callback);
	};
};
