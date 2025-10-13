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
		wait: 200,
	},
);

process.exitCode = 1;

if (process.env.EXIT_HOOK_SYNC === '1') {
	process.exit(); // eslint-disable-line unicorn/no-process-exit
}

gracefulExit();
