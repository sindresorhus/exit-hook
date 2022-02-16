type ExitHook = {
	/**
	Run some code when the process exits.

	The `process.on('exit')` event doesn't catch all the ways a process can exit.

	This package is useful for cleaning up before exiting. To exit safely, call
	`exitHook.exit()` instead of `process.exit()`.

	@param onExit - The callback function to execute when the process exits. If asynchronous, maxWait is required.
	@param maxWait - An optional duration in ms to wait for onExit to complete. Required for asynchronous exit handlers.
	@returns A function that removes the hook when called.

	@example
	```
	import exitHook from 'exit-hook';

	exitHook(() => {
		console.log('Exiting');
	});

	// You can add multiple hooks, even across files
	// asynchronous hooks should include an amount of time to wait for
	// their completion
	exitHook(async () => {
		console.log('Exiting 2');
	}, 100);

	throw new Error('🦄');

	//=> 'Exiting'
	//=> 'Exiting 2'

	// Removing an exit hook:
	const unsubscribe = exitHook(() => {});

	unsubscribe();
	```
	*/
	(onExit: () => void | (() => Promise<void>), maxWait?: number): () => void;

	/**
	Exit the process safely instead of calling process.exit()

	Because `process.exit()` skips asynchronous calls, it is recommended to call
	`exitHook.exit()` instead. The exit hook will ensure asynchronous calls are
	completed (within their maximum wait time) before exiting the process.
	 */
	exit: () => void;
};

declare const exitHook: ExitHook;

export = exitHook;
