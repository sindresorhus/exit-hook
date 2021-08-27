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
export default function exitHook(onExit: () => void): () => void;
