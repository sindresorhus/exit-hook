import exitHook, {asyncExitHook} from '../index.js';

exitHook(signal => {
	console.log(signal);
});

asyncExitHook(async signal => {
	console.log(signal);
}, {
	minimumWait: 200,
});

setInterval(() => {}, 1 << 30);
