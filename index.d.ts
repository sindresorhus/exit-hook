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

/**
Run code asynchronously when the process exits.

@see https://github.com/sindresorhus/exit-hook/blob/main/readme.md#asynchronous-exit-notes
@param options - The options, including a minimum wait time.
@param onExit - The callback function to execute when the process exits.
@returns A function that removes the hook when called.

@example
```
import { asyncExitHook } from 'exit-hook';

asyncExitHook({
	// wait this long before exiting
	minimumWait: 500
}, () => {
	console.log('Exiting');
});

throw new Error('🦄');

//=> 'Exiting'

// Removing an exit hook:
const unsubscribe = asyncExitHook({}, () => {});

unsubscribe();
```
*/
declare function asyncExitHook(onExit: onExitAsyncCallback, options: asyncHookOptions): unsubscribeCallback;

/**
Exit the process and complete all asynchronous hooks.

If using asyncExitHook, consider using `gracefulExit` instead of
`process.exit()` to ensure all asynchronous tasks are given an opportunity to
run.

@param signal - The exit code to use, identical to `process.exit`
@see https://github.com/sindresorhus/exit-hook/blob/main/readme.md#asynchronous-exit-notes
@returns void

@example
```
import { asyncExitHook, gracefulExit } from 'exit-hook';

asyncExitHook({
	// wait this long before exiting
	minimumWait: 500
}, () => {
	console.log('Exiting');
});

// instead of process.exit
gracefulExit();
```
*/
declare function gracefulExit(signal?: number): void;

/** The onExit callback */
type onExitCallback = () => void;

/** The onExit callback */
type onExitAsyncCallback = () => Promise<void>;

/** An unsubscribe method that unregisters the hook */
type unsubscribeCallback = () => void;

/** Options for asynchronous hooks */
type asyncHookOptions = {
	/** The minimum amount of time to wait for this process to terminate */
	minimumWait: number;
};

export default exitHook;
export {asyncExitHook, gracefulExit};
