import process from 'node:process';

const asyncCallbacks = new Set();
const callbacks = new Set();

let isCalled = false;
let isRegistered = false;

async function exit(shouldManuallyExit, isSynchronous, signal) {
	if (asyncCallbacks.size > 0 && isSynchronous) {
		console.error([
			'SYNCHRONOUS TERMINATION NOTICE:',
			'When explicitly exiting the process via process.exit or via a parent process,',
			'asynchronous tasks in your exitHooks will not run. Either remove these tasks,',
			'use exitHook.exit() instead of process.exit(), or ensure your parent process',
			'sends a SIGINT to the process running this code.',
		].join(' '));
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

	for (const callback of callbacks) {
		callback();
	}

	if (isSynchronous) {
		done();
		return;
	}

	const promises = [];
	let forceAfter = 0;
	for (const [callback, wait] of asyncCallbacks) {
		forceAfter = Math.max(forceAfter, wait);
		promises.push(Promise.resolve(callback()));
	}

	// Force exit if we exceeded our maxWait value
	const asyncTimer = setTimeout(() => {
		done(true);
	}, forceAfter);

	await Promise.all(promises);
	clearTimeout(asyncTimer);
	done();
}

function addHook(options) {
	const {onExit, minimumWait, isSynchronous} = options;
	const asyncCallbackConfig = [onExit, minimumWait];
	if (isSynchronous) {
		callbacks.add(onExit);
	} else {
		asyncCallbacks.add(asyncCallbackConfig);
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
		if (isSynchronous) {
			callbacks.delete(onExit);
		} else {
			asyncCallbacks.delete(asyncCallbackConfig);
		}
	};
}

function exitHook(onExit) {
	return addHook({
		onExit,
		minimumWait: null,
		isSynchronous: true,
	});
}

function asyncExitHook(onExit, hookOptions) {
	if (typeof hookOptions?.minimumWait !== 'number') {
		throw new TypeError('options.minimumWait must be set to a numeric value');
	}

	return addHook({
		onExit,
		minimumWait: hookOptions.minimumWait,
		isSynchronous: false,
	});
}

function gracefulExit(signal = 0) {
	exit(true, false, -128 + signal);
}

export default exitHook;

export {asyncExitHook, gracefulExit};
