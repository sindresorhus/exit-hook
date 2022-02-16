import process from 'node:process';

const callbacks = new Set();
const callbacksSync = new Set();

let isCalled = false;
let isRegistered = false;

function exit(shouldManuallyExit, isSynchronous, signal) {
	if (callbacks.size > 0 && isSynchronous) {
		console.error('SYNCHRONOUS TERMINATION NOTICE:');
		console.error('When explicitly exiting the process via process.exit, asynchronous');
		console.error('tasks in your exitHooks will not run. Either remove these tasks,');
		console.error('or use exitHook.exit() instead.');
	}

	if (isCalled) {
		return;
	}

	isCalled = true;

	const done = (force = false) => {
		if (force === true || shouldManuallyExit === true) {
			process.exit(128 + signal); // eslint-disable-line unicorn/no-process-exit
		}
	};

	for (const callback of callbacksSync) {
		callback();
	}

	if (isSynchronous) {
		done();
		return;
	}

	const promises = [];
	let maxWait = 0;
	for (const [callback, wait] of callbacks) {
		maxWait = Math.max(maxWait, wait);
		promises.push(Promise.resolve(callback()));
	}

	// Force exit if we exceeded our maxWait value
	const asyncTimer = setTimeout(() => {
		done(true);
	}, maxWait);

	Promise.all(promises).then(() => { // eslint-disable-line promise/prefer-await-to-then
		clearTimeout(asyncTimer);
		done();
	});
}

function exitHook(onExit, maxWait) {
	const isSync = typeof maxWait === 'undefined';
	const asyncCallbackConfig = [onExit, maxWait];
	if (isSync) {
		callbacksSync.add(onExit);
	} else {
		callbacks.add(asyncCallbackConfig);
	}

	if (!isRegistered) {
		isRegistered = true;

		// Exit cases that support asynchronous handling
		process.once('beforeExit', exit.bind(undefined, true, false, 0));
		process.once('SIGINT', exit.bind(undefined, true, false, 2));
		process.once('SIGTERM', exit.bind(undefined, true, false, 15));

		// Explicit exit events. Calling will force an immediate exit and run all
		// synchronous hooks. Explicit exits must not extend the node process
		// artificially. Will log errors if asynchronous calls exist.
		process.once('exit', exit.bind(undefined, false, true, 0));

		// PM2 Cluster shutdown message. Caught to support async handlers with pm2,
		// needed because explicitly calling process.exit() doesn't trigger the
		// beforeExit event, and the exit event cannot support async handlers,
		// since the event loop is never called after it.
		process.on('message', message => {
			if (message === 'shutdown') {
				exit(true, true, -128);
			}
		});
	}

	return () => {
		if (isSync) {
			callbacksSync.delete(onExit);
		} else {
			callbacks.delete(asyncCallbackConfig);
		}
	};
}

exitHook.exit = (signal = 0) => {
	exit(true, false, -128 + signal);
};

export default exitHook;
