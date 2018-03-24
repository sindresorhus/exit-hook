import test from 'ava';
import execa from 'execa';

test('main', async t => {
	const {stdout} = await execa(process.execPath, ['fixture.js']);
	t.is(stdout, 'foo\nbar');
});
