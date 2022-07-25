/**
Run some code when the process exits.

The `process.on('exit')` event doesn't catch all the ways a process can exit.

This is useful for cleaning synchronously before exiting.

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
export default function exitHook(onExit: () => void): () => void;

/**
Run code asynchronously when the process exits.

@see https://github.com/sindresorhus/exit-hook/blob/main/readme.md#asynchronous-exit-notes
@param onExit - The callback function to execute when the process exits via `gracefulExit`, and will be wrapped in `Promise.resolve`.
@param minimumWait - The amount of time in ms that `onExit` is expected to take.
@returns A function that removes the hook when called.

@example
```
import {asyncExitHook} from 'exit-hook';

asyncExitHook(() => {
	console.log('Exiting');
}, 500);

throw new Error('🦄');

//=> 'Exiting'

// Removing an exit hook:
const unsubscribe = asyncExitHook({}, () => {});

unsubscribe();
```
*/
export function asyncExitHook(onExit: () => (void | Promise<void>), minimumWait: number): () => void;

/**
Exit the process and makes a best-effort to complete all asynchronous hooks.

If using asyncExitHook, consider using `gracefulExit` instead of `process.exit()` to ensure all asynchronous tasks are given an opportunity to run.

@param signal - The exit code to use, identical to `process.exit`
@see https://github.com/sindresorhus/exit-hook/blob/main/readme.md#asynchronous-exit-notes

@example
```
import {asyncExitHook, gracefulExit} from 'exit-hook';

asyncExitHook(() => {
	console.log('Exiting');
}, 500);

// instead of process.exit
gracefulExit();
```
*/
export function gracefulExit(signal?: number): void;
