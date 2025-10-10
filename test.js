import process from 'node:process';
import test from 'ava';
import {execa} from 'execa';
import exitHook, {asyncExitHook} from './index.js';

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
