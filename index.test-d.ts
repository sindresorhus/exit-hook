import {expectType} from 'tsd';
import exitHook = require('.');

const unsubscribe = exitHook(() => {});

expectType<() => void>(unsubscribe);
unsubscribe();
