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

`exitHook` comes with an asynchronous API via `exitHook.async` which under **specific conditions** will allow you to complete asynchronous tasks such as writing to a log file or completing pending network operations. Because node.js does not offer an asynchronous shutdown API [#1](https://github.com/nodejs/node/discussions/29480#discussioncomment-99213) [#2](https://github.com/nodejs/node/discussions/29480#discussioncomment-99217), `exitHook.async` will make a "best effort" attempt to shut down the process and run your asynchronous tasks.

```
SYNCHRONOUS TERMINATION NOTICE:
When explicitly exiting the process via process.exit or via a parent process,
asynchronous tasks in your exitHooks will not run. Either remove these tasks,
use exitHook.exit() instead of process.exit(), or ensure your parent process
sends a SIGINT to the process running this code.
```

The above error will be generated if your exit hooks are ran in a synchronous manner but there are asynchronous callbacks registered to the shutdown handler. To avoid this, ensure you're only exiting via `exitHook.exit(signal)` or that an upstream process manager is sending a `SIGINT` or `SIGTERM` signal to node.js.

## Caveat: Avoid `process.exit()`
The `process.exit()` function requires all exit handlers to be synchronous and will not run with `exitHook.async`. If you wish to manually exit the process and have asynchronous callbacks, please use `exitHook.exit(signal)` instead which will manually exit the process after all shutdown tasks are complete.

## Caveat: Upstream Termination
Process managers may not send a `SIGINT` or `SIGTERM` when ending your node.js process, which are the signals `exitHook` is designed to understand. If an unhandled signal forces a synchronous exit, your asynchronous exit hooks will not run. A console error will be generated to make you aware that a synchronous exit occured.

## Caveat: Best Effort
Asynchronous exit hooks should be a "best effort" attempt to clean up remaining tasks. Because tasks may not run under certain circumstances, your hooks should treat a clean exit as an ideal scenario.

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