/**
Run some code when the process exits.

The `process.on('exit')` event doesn't catch all the ways a process can exit.

This package is useful for cleaning up before exiting.

@param onExit - The callback function to execute when the process exits.
@returns A function that removes the hook when called.

@example
```
import exitHook from 'exit-hook';

exitHook(() => {
	console.log('Exiting');
});

// You can add multiple hooks, even across files
exitHook(() => {
	console.log('Exiting 2');
});

throw new Error('🦄');

//=> 'Exiting'
//=> 'Exiting 2'

// Removing an exit hook:
const unsubscribe = exitHook(() => {});

unsubscribe();
```
*/
declare function exitHook(onExit: onExitCallback): unsubscribeCallback;

declare namespace exitHook {
	/**
	Run some code when the process exits.

	Please see https://github.com/sindresorhus/exit-hook/blob/main/readme.md#async-notes
	for important considerations before using `exitHook.async`.

	By default, `onExit` works to shut down a node.js process in a synchronous
	manner. If you have pending IO operations, it may be useful to wait for
	those tasks to complete before performing the shutdown of the node.js
	process.
	*/
	function async(options: asyncHookOptions): unsubscribeCallback;

	/**
	Exit the process and complete all asynchronous hooks.

	Please see https://github.com/sindresorhus/exit-hook/blob/main/readme.md#async-notes
	for important considerations before using `exitHook.async`.

	When using asynchronous hooks, you should use `exitHook.exit` instead of
	calling `process.exit` directly. In node, `process.exit` does not wait for
	asynchronous tasks to complete before termination.

	@param signal - The exit code to use, identical to `process.exit`
	@returns void

	@example
	```
	import exitHook from 'exit-hook';

	exitHook.async({
		async onExit() {
			console.log('Exiting');
		},
		minWait: 100
	});

	// instead of process.exit
	exitHook.exit();
	```
	*/
	function exit(signal: number): void;
}

/** The onExit callback */
type onExitCallback = () => void;
/** The onExit callback */
type onExitAsyncCallback = () => Promise<void>;
/** An unsubscribe method that unregisters the hook */
type unsubscribeCallback = () => void;

/** Options for asynchronous hooks */
type asyncHookOptions = {
	/** An asynchronous callback to run on exit. Returns an unsubscribe callback */
	onExit: onExitAsyncCallback;
	/** The minimum amount of time to wait for this process to terminate */
	minWait?: number;
};

export default exitHook;
