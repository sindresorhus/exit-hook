import {expectType} from 'tsd';
import exitHook from './index.js';

const unsubscribe = exitHook(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

const asyncUnsubscribe = exitHook.async({
	async onExit() {}, // eslint-disable-line @typescript-eslint/no-empty-function
	minWait: 100,
});

expectType<() => void>(unsubscribe);
unsubscribe();

expectType<() => void>(asyncUnsubscribe);
asyncUnsubscribe();
