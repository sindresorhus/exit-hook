import {expectType} from 'tsd';
import exitHook = require('./index.js');

const unsubscribe = exitHook(() => {});

expectType<() => void>(unsubscribe);
unsubscribe();
