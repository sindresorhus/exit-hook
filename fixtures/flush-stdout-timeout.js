import process from 'node:process';
import {asyncExitHook, gracefulExit} from '../index.js';

const chunk = 'x'.repeat(1024 * 1024);

asyncExitHook(() => {
	for (let chunkIndex = 0; chunkIndex < 5; chunkIndex++) {
		const canContinue = process.stdout.write(`${chunk}\n`);
		if (!canContinue) {
			break;
		}
	}
}, {wait: 10});

setTimeout(() => {
	gracefulExit();
}, 50);
