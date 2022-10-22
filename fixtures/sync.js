import process from 'node:process';
import exitHook from '../index.js';

exitHook(() => {
	console.log('foo');
});

exitHook(() => {
	console.log('bar');
});

const unsubscribe = exitHook(() => {
	console.log('baz');
});

unsubscribe();

process.exit(0); // eslint-disable-line unicorn/no-process-exit
