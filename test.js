import process from 'node:process';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {setTimeout as delay} from 'node:timers/promises';
import test from 'ava';
import {execa} from 'execa';
import exitHook, {asyncExitHook} from './index.js';

const isContinuousIntegration = Boolean(process.env.CI);

test('main', async t => {
	const {stdout, stderr, exitCode} = await execa(process.execPath, ['./fixtures/sync.js']);
	t.is(stdout, 'foo\nbar');
	t.is(stderr, '');
	t.is(exitCode, 0);
});

test('main with exitCode', async t => {
	try {
		await execa(process.execPath, ['./fixtures/sync-exit-code.js']);
		t.fail();
	} catch ({stdout, stderr, exitCode}) {
		t.is(stdout, 'foo\nbar');
		t.is(stderr, '');
		t.is(exitCode, 1);
	}
});

test('main-empty', async t => {
	const {stderr, exitCode} = await execa(process.execPath, ['./fixtures/empty.js']);
	t.is(stderr, '');
	t.is(exitCode, 0);
});

test('main-empty with exitCode', async t => {
	try {
		await execa(process.execPath, ['./fixtures/empty-exit-code.js']);
		t.fail();
	} catch ({stdout, stderr, exitCode}) {
		t.is(stdout, '');
		t.is(stderr, '');
		t.is(exitCode, 1);
	}
});

test('main-async', async t => {
	const {stdout, stderr, exitCode} = await execa(process.execPath, ['./fixtures/async.js']);
	t.is(stdout, 'foo\nbar\nquux');
	t.is(stderr, '');
	t.is(exitCode, 0);
});

test('main-async with exitCode', async t => {
	try {
		await execa(process.execPath, ['./fixtures/async-exit-code.js']);
		t.fail();
	} catch ({stdout, stderr, exitCode}) {
		t.is(stdout, 'foo\nbar\nquux');
		t.is(stderr, '');
		t.is(exitCode, 1);
	}
});

test('main-async-notice', async t => {
	const {stdout, stderr, exitCode} = await execa(process.execPath, ['./fixtures/async.js'], {
		env: {
			EXIT_HOOK_SYNC: '1',
		},
	});
	t.is(stdout, 'foo\nbar');
	t.regex(stderr, /SYNCHRONOUS TERMINATION NOTICE/);
	t.is(exitCode, 0);
});

test('main-async-notice with exitCode', async t => {
	try {
		await execa(process.execPath, ['./fixtures/async-exit-code.js'], {
			env: {
				EXIT_HOOK_SYNC: '1',
			},
		});
		t.fail();
	} catch ({stdout, stderr, exitCode}) {
		t.is(stdout, 'foo\nbar');
		t.regex(stderr, /SYNCHRONOUS TERMINATION NOTICE/);
		t.is(exitCode, 1);
	}
});

test('gracefulExit with explicit exit code', async t => {
	try {
		await execa(process.execPath, ['./fixtures/graceful-exit-code.js']);
		t.fail();
	} catch ({stdout, stderr, exitCode}) {
		t.is(stdout, 'exiting with code 1');
		t.is(stderr, '');
		t.is(exitCode, 1);
	}
});

test('listener count', t => {
	// This function is used as on node20+ flushSync is added internally to the exit handler of nodejs
	const exitListenerCount = () => process.listeners('exit').filter(fn => fn.name !== 'flushSync').length;
	t.is(exitListenerCount(), 0);

	const unsubscribe1 = exitHook(() => {});
	const unsubscribe2 = exitHook(() => {});
	t.is(exitListenerCount(), 1);

	// Remove all listeners
	unsubscribe1();
	unsubscribe2();
	t.is(exitListenerCount(), 1);

	// Re-add listener
	const unsubscribe3 = exitHook(() => {});
	t.is(exitListenerCount(), 1);

	// Remove again
	unsubscribe3();
	t.is(exitListenerCount(), 1);

	// Add async style listener
	const unsubscribe4 = asyncExitHook(
		async () => {},
		{
			wait: 100,
		},
	);
	t.is(exitListenerCount(), 1);

	// Remove again
	unsubscribe4();
	t.is(exitListenerCount(), 1);
});

test('type enforcing', t => {
	// Non-function passed to `exitHook`.
	t.throws(() => {
		exitHook(null);
	}, {instanceOf: TypeError});

	// Non-function passed to `asyncExitHook`.
	t.throws(() => {
		asyncExitHook(null, {
			wait: 100,
		});
	}, {
		instanceOf: TypeError,
	});

	// Non-numeric passed to `wait` option.
	t.throws(() => {
		asyncExitHook(async () => true, {wait: 'abc'});
	});

	// Empty value passed to `wait` option.
	t.throws(() => {
		asyncExitHook(async () => true, {});
	});
});

test('flushes stdout before exit with async hook', async t => {
	const lineCount = 10_000;
	const {stdout, exitCode} = await execa(process.execPath, ['./fixtures/flush-stdout.js', String(lineCount)]);
	const lines = stdout.split('\n').filter(Boolean);
	t.is(lines.length, lineCount);
	t.is(exitCode, 0);
});

test('flushes stdout before exit with short wait and backpressure', async t => {
	const lineCount = 20_000;
	const childProcess = spawn(process.execPath, ['./fixtures/flush-stdout-short-wait.js', String(lineCount)], {
		stdio: ['ignore', 'pipe', 'ignore'],
	});

	childProcess.stdout.setEncoding('utf8');

	let stdout = '';
	childProcess.stdout.on('data', data => {
		stdout += data;
	});

	childProcess.stdout.pause();
	await delay(200);
	childProcess.stdout.resume();

	const [exitCode] = await once(childProcess, 'close');
	t.is(exitCode, 0);

	const lines = stdout.split('\n').filter(Boolean);
	t.is(lines.length, lineCount);
});

test('flushes stdout and stderr before exit with short wait and backpressure', async t => {
	const lineCount = 10_000;
	const childProcess = spawn(process.execPath, ['./fixtures/flush-stdout-stderr-short-wait.js', String(lineCount)], {
		stdio: ['ignore', 'pipe', 'pipe'],
	});

	childProcess.stdout.setEncoding('utf8');
	childProcess.stderr.setEncoding('utf8');

	let stdout = '';
	let stderr = '';
	childProcess.stdout.on('data', data => {
		stdout += data;
	});
	childProcess.stderr.on('data', data => {
		stderr += data;
	});

	childProcess.stdout.pause();
	childProcess.stderr.pause();
	await delay(200);
	childProcess.stdout.resume();
	childProcess.stderr.resume();

	const [exitCode] = await once(childProcess, 'close');
	t.is(exitCode, 0);

	const stdoutLines = stdout.split('\n').filter(Boolean);
	const stderrLines = stderr.split('\n').filter(Boolean);
	t.is(stdoutLines.length, lineCount);
	t.is(stderrLines.length, lineCount);
});

test('flush timeout prevents hanging when stdout is blocked', async t => {
	t.timeout(isContinuousIntegration ? 15_000 : 8000);

	const startTime = Date.now();
	const childProcess = spawn(process.execPath, ['./fixtures/flush-stdout-timeout.js'], {
		stdio: ['ignore', 'pipe', 'ignore'],
	});
	const closePromise = once(childProcess, 'close');

	childProcess.stdout.pause();
	await delay(1500);
	childProcess.stdout.resume();

	const [exitCode] = await closePromise;
	const elapsedMilliseconds = Date.now() - startTime;
	t.is(exitCode, 0);
	t.true(elapsedMilliseconds >= 900);
});

test('flushes stdout before exit with sync hook', async t => {
	const lineCount = 10_000;
	const {stdout, exitCode} = await execa(process.execPath, ['./fixtures/flush-stdout-sync.js', String(lineCount)]);
	const lines = stdout.split('\n').filter(Boolean);
	t.is(lines.length, lineCount);
	t.is(exitCode, 0);
});

test('does not throw when stdio is closed before flush', async t => {
	const {stdout, stderr, exitCode} = await execa(process.execPath, ['./fixtures/closed-stdio.js']);
	t.is(stdout, '');
	t.is(stderr, '');
	t.is(exitCode, 0);
});

const signalTests = [
	['SIGINT', 130],
	['SIGTERM', 143],
];

for (const [signal, exitCode] of signalTests) {
	test(signal, async t => {
		const subprocess = execa(process.execPath, ['./fixtures/signal.js']);

		setTimeout(() => {
			subprocess.kill(signal);
		}, 1000);

		try {
			await subprocess;
		} catch (error) {
			t.is(error.exitCode, exitCode);
			t.is(error.stderr, '');
			t.is(error.stdout, `${exitCode}\n${exitCode}`);
		}
	});

	test(`${signal} causes process.exitCode to be ignored`, async t => {
		const subprocess = execa(process.execPath, ['./fixtures/signal-exit-code.js']);

		setTimeout(() => {
			subprocess.kill(signal);
		}, 1000);

		try {
			await subprocess;
		} catch (error) {
			t.is(error.exitCode, exitCode);
			t.is(error.stderr, '');
			t.is(error.stdout, `${exitCode}\n${exitCode}`);
		}
	});
}
