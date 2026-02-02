import process from 'node:process';
import exitHook, {gracefulExit} from '../index.js';

const lineCount = Number.parseInt(process.argv[2], 10);

exitHook(() => {
	for (let i = 0; i < lineCount; i++) {
		process.stdout.write(`${'x'.repeat(200)}\n`);
	}
});

gracefulExit();
