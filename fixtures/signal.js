import exitHook, {asyncExitHook} from '../index.js';

exitHook(signal => {
	console.log(signal);
});

asyncExitHook(async signal => {
	console.log(signal);
}, {
	wait: 200,
});

setInterval(() => {}, 1 << 30);
