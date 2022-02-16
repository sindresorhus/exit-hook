import exitHook from './index.js';

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

exitHook(async () => {
	await new Promise((resolve, _reject) => {
		setTimeout(() => {
			resolve();
		}, 100);
	});
	console.log('quux');
}, 200);

exitHook.exit();
