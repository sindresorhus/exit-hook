# exit-hook [![Build Status](https://travis-ci.org/sindresorhus/exit-hook.svg?branch=master)](https://travis-ci.org/sindresorhus/exit-hook)

> Run some code when the process exits

The `process.on('exit')` event doesn't catch all the ways a process can exit.

This package is useful for cleaning up before exiting.

Check out [`async-exit-hook`](https://github.com/tapppi/async-exit-hook) if you need async support.


## Install

```
$ npm install exit-hook
```


## Usage

```js
const exitHook = require('exit-hook');

exitHook(() => {
	console.log('Exiting');
});

// You can add multiple hooks, even across files
exitHook(() => {
	console.log('Exiting 2');
});

throw new Error('🦄');

//=> 'Exiting'
//=> 'Exiting 2'
```

Removing an exit hook:

```js
const exitHook = require('exit-hook');

const unsubscribe = exitHook(() => {});

unsubscribe();
```


## API

### exitHook(callback)

Returns a function that removes the hook when called.

#### callback

Type: `Function`

The callback to execute when the process exits.


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
