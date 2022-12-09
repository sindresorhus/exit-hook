import process from 'node:process';
import exitHook, {asyncExitHook, gracefulExit} from '../index.js';

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
	{
		minimumWait: 200,
	},
);

asyncExitHook(
	async () => {
		await new Promise(resolve => {
			setTimeout(() => {
				resolve();
			}, 500);
		});
		console.log('wut');
	},
	200,
);

asyncExitHook(
	async () => {
		await new Promise(resolve => {
			setTimeout(() => {
				resolve();
			}, 100);
		});
		console.log('quz');
	},
	200,
);

if (process.env.EXIT_HOOK_SYNC === '1') {
	process.exit(0); // eslint-disable-line unicorn/no-process-exit
}

gracefulExit();
