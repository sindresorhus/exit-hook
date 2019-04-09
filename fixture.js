'use strict';
const exitHook = require('.');

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

process.exit(); // eslint-disable-line unicorn/no-process-exit
