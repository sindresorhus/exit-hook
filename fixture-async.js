import exitHook, {asyncExitHook, gracefulExit} from './index.js';

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

asyncExitHook(
	async () => {
		await new Promise(resolve => {
			setTimeout(() => {
				resolve();
			}, 100);
		});
		console.log('quux');
	},
	200,
);

gracefulExit();
