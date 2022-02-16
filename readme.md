# exit-hook

> Run some code when the process exits

The `process.on('exit')` event doesn't catch all the ways a process can exit.

This package is useful for cleaning up before exiting.

## Install

```
$ npm install exit-hook
```

## Usage

```js
import exitHook from 'exit-hook';

exitHook(() => {
	console.log('Exiting');
});

// You can add multiple hooks, even across files
exitHook(() => {
	console.log('Exiting 2');
});

// Hooks can be asynchronous by telling exitHooks to wait
exitHook(async () => {
	console.log('Exiting 3, wait max 100ms');
}, 100);

throw new Error('🦄');

//=> 'Exiting'
//=> 'Exiting 2'
//=> 'Exiting 3, wait max 100ms'
```

Removing an exit hook:

```js
import exitHook from 'exit-hook';

const unsubscribe = exitHook(() => {});

unsubscribe();
```

## API

### exitHook(onExit, maxWait?)

Returns a function that removes the hook when called.

#### onExit

Type: `Function`

The callback function to execute when the process exits.

#### maxWait

Type: `Number` (optional)

If provided, process exit will be delayed by at least this amount of time in ms to allow the `onExit` to complete.

---

<div align="center">
	<b>
		<a href="https://tidelift.com/subscription/pkg/npm-exit-hook?utm_source=npm-exit-hook&utm_medium=referral&utm_campaign=readme">Get professional support for this package with a Tidelift subscription</a>
	</b>
	<br>
	<sub>
		Tidelift helps make open source sustainable for maintainers while giving companies<br>assurances about security, maintenance, and licensing for their dependencies.
	</sub>
</div>
