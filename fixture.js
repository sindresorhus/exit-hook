'use strict';
const exitHook = require('.');

exitHook(() => {
	console.log('foo');
});

exitHook(() => {
	console.log('bar');
});

process.exit();
