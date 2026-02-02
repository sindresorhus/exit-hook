import process from 'node:process';
import {asyncExitHook, gracefulExit} from '../index.js';

process.stdout.end();
process.stderr.end();

asyncExitHook(() => {}, {wait: 100});

gracefulExit();
