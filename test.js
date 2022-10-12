import process from 'node:process';
import test from 'ava';
import execa from 'execa';
import exitHook, {asyncExitHook} from './index.js';

test('main', async t => {
	const {stdout, stderr} = await execa(process.execPath, ['fixture.js']);
	t.is(stdout, 'foo\nbar');
	t.is(stderr, '');
});

test('main-async', async t => {
	const {stdout, stderr} = await execa(process.execPath, ['fixture-async.js']);
	t.is(stdout, 'foo\nbar\nquux');
	t.is(stderr, '');
});

test('main-async-notice', async t => {
	const {stdout, stderr} = await execa(process.execPath, ['fixture-async.js'], {
		env: {
			EXIT_HOOK_SYNC: '1',
		},
	});
	t.is(stdout, 'foo\nbar');
	t.regex(stderr, /SYNCHRONOUS TERMINATION NOTICE/);
});

test('listener count', t => {
	t.is(process.listenerCount('exit'), 0);

	const unsubscribe1 = exitHook(() => {});
	const unsubscribe2 = exitHook(() => {});
	t.is(process.listenerCount('exit'), 1);

	// Remove all listeners
	unsubscribe1();
	unsubscribe2();
	t.is(process.listenerCount('exit'), 1);

	// Re-add listener
	const unsubscribe3 = exitHook(() => {});
	t.is(process.listenerCount('exit'), 1);

	// Remove again
	unsubscribe3();
	t.is(process.listenerCount('exit'), 1);

	// Add async style listener
	const unsubscribe4 = asyncExitHook(
		async () => {},
		{
			minimumWait: 100,
		},
	);
	t.is(process.listenerCount('exit'), 1);

	// Remove again
	unsubscribe4();
	t.is(process.listenerCount('exit'), 1);
});

test('type enforcing', t => {
	// Non-function passed to `exitHook`.
	t.throws(() => {
		exitHook(null);
	}, {instanceOf: TypeError});

	// Non-function passed to `asyncExitHook`.
	t.throws(() => {
		asyncExitHook(null, {
			minimumWait: 100,
		});
	}, {
		instanceOf: TypeError,
	});

	// Non-numeric passed to `minimumWait` option.
	t.throws(() => {
		asyncExitHook(async () => true, {});
	});
});
