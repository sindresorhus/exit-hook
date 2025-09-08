import process from 'node:process';
import exitHook from '../index.js';

process.exitCode = 1;
exitHook(() => {
	// https://github.com/sindresorhus/exit-hook/issues/23
});
