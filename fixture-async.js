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

exitHook.async({
	async onExit() {
		await new Promise((resolve, _reject) => {
			setTimeout(() => {
				resolve();
			}, 100);
		});
		console.log('quux');
	},
	minWait: 200,
});

exitHook.exit();
