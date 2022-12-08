import {expectType} from 'tsd';
import exitHook, {asyncExitHook} from '../source/index.js';

const unsubscribe = exitHook(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

const asyncUnsubscribe = asyncExitHook(async () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
	{minimumWait: 300},
);

expectType<() => void>(unsubscribe);
unsubscribe();

expectType<() => void>(asyncUnsubscribe);
asyncUnsubscribe();
