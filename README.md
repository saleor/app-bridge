# Saleor App Bridge

## Installation

```bash
npm i @saleor/app-bridge
```

## Usage

First initialize the package by running `createApp()`:

```js
import { createApp } from "@saleor/app-bridge";

const app = createApp();
```

Access app state:

```js
const { token, domain, ready, id } = app.getState();
```

## Events

Events are messages that originate in Saleor Dashboard.

### Available methods

**`subscribe(eventType, callback)`** - can be used to listen to particular event type. It returns an unsubscribe function, which unregisters the callback.

Example:

```js
const unsubscribe = app.subscribe("handshake", (payload) => {
  setToken(payload.token); // do something with event payload
  const { token } = app.getState(); // you can also get app's current state here
});

// unsubscribe when callback is no longer needed
unsubscribe();
```

**`unsubscribeAll(eventType?)`** - unregisters all callbacks of provided type. If no type was provided, it will remove all event callbacks.

Example:

```js
app.unsubscribeAll("handshake"); // unsubscribe from all handshake events

app.unsubscribeAll(); // unsubscribe from all events
```

### Available event types

| Event type  | Description                                                                  |
| :---------- | :--------------------------------------------------------------------------- |
| `handshake` | Fired when iFrame containing the App is initialized or new token is assigned |
| `response`  | Fired when Dashboard responds to an Action                                   |
| `redirect`  | Fired when Dashboard change a subpath within the app path                    |
| `theme`     | Fired when Dashboard change the theme                                        |

## Actions

Actions expose a high-level API to communicate with Saleor Dashboard. They're exported under an `actions` namespace.

### Available methods

**`dispatch(action)`** - dispatches an Action. Returns a promise which resolves when action is successfully completed.

Example:

```js
import { actions } from "@saleor/app-bridge";

const handleRedirect = async () => {
  await app.dispatch(actions.Redirect({ to: "/orders" }));
  console.log("Redirect complete!");
};

handleRedirect();
```

### Available actions

| Action     | Arguments                                                        | Description |
| :--------- | :--------------------------------------------------------------- | :---------- |
| `Redirect` | `to` (string) - relative (inside Dashboard) or absolute URL path |             |
|            | `newContext` (boolean) - should open in a new browsing context   |             |
|`Notification` | `status` (`info` / `success` / `warning` / `error` / undefined)|            |
|            | `title` (string / undefined) - title of the notification         |             |
|            | `text` (string / undefined) - content of the notification        |             |
|            | `apiMessage` (string / undefined) - error log from api           |             |

