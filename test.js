import process from 'node:process';
import test from 'ava';
import execa from 'execa';
import exitHook from './index.js';

test('main', async t => {
	const {stdout} = await execa(process.execPath, ['fixture.js']);
	t.is(stdout, 'foo\nbar');
});

test('main-async', async t => {
	const {stdout} = await execa(process.execPath, ['fixture-async.js']);
	t.is(stdout, 'foo\nbar\nquux');
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
	const unsubscribe4 = exitHook(
		async () => {},
		{
			maxWait: 100,
		},
	);
	t.is(process.listenerCount('exit'), 1);

	// Remove again
	unsubscribe4();
	t.is(process.listenerCount('exit'), 1);
});
