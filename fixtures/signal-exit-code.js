import process from 'node:process';
import exitHook, {asyncExitHook} from '../index.js';

process.exitCode = 1;

exitHook(signal => {
	console.log(signal);
});

asyncExitHook(async signal => {
	console.log(signal);
}, {
	wait: 200,
});

setInterval(() => {}, 1e9);
