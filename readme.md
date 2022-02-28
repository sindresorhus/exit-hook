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

throw new Error('🦄');

//=> 'Exiting'
//=> 'Exiting 2'
```

Removing an exit hook:

```js
import exitHook from 'exit-hook';

const unsubscribe = exitHook(() => {});

unsubscribe();
```

## API

### exitHook(onExit)

Returns a function that removes the hook when called.

#### onExit

Type: `Function`

The callback function to execute when the process exits.

### exitHook.async(asyncHookOptions)

Returns a function that removes the hook when called. Please see [Async Notes](#async-notes) for considerations when using the asynchronous API.

#### asyncHookOptions

Type: `Object`

A set of options for registering an asynchronous hook

##### asyncHookOptions.onExit

An asynchronous function that will be called on shutdown, returning a promise.

##### asyncHookOptions.minWait

The minimum amount of time to wait for this asynchronous hook to complete. Defaults to `1000`ms.

# Async Notes

`exitHook` comes with an asynchronous API via `exitHook.async` which under **specific conditions** will allow you to complete asynchronous tasks such as writing to a log file or completing pending IO operations. For reliable execution of your asynchronous hooks, you must be confident the following statements are true:

- **Your process is terminated via an unhandled exception, `SIGINT`, or `SIGTERM` signal and does _not_ use `process.exit`.** node.js does not offer a asynchronous shutdown API [#1](https://github.com/nodejs/node/discussions/29480#discussioncomment-99213) [#2](https://github.com/nodejs/node/discussions/29480#discussioncomment-99217), as doing so could create shutdown handlers that delay the termination of the node.js process indefinitely.
- **Your handlers are a "best effort" cleanup.** Because there are many ways a shutdown of a node process can be interrupted, and killed, asynchronous handlers should always adopt a "best effort" of cleanup. If an asynchronous handler does not run, it shouldn't leave your environment in a broken state.

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