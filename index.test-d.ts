import {expectType} from 'tsd';
import exitHook from './index.js';

const unsubscribe = exitHook(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

expectType<() => void>(unsubscribe);
unsubscribe();
