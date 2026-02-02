import process from 'node:process';
import {asyncExitHook, gracefulExit} from '../index.js';

const lineCount = Number.parseInt(process.argv[2], 10);

asyncExitHook(() => {
	for (let i = 0; i < lineCount; i++) {
		process.stdout.write(`${'x'.repeat(200)}\n`);
	}
}, {wait: 10});

setTimeout(() => {
	gracefulExit();
}, 50);
