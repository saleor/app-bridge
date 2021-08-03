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
const { token, domain, ready } = app.getState();
```

Subscribe to events:
```js
const unsubscribe = app.subscribe("handshake", (state) => state.token);

// unsubscribe when callback is no longer needed
unsubscribe();
```

### Available events
| Event name  | Description                                                                      |
| :---------  | :------------------------------------------------------------------------------- |
| `handshake` | Fired when iFrame containing the App is initialized or new token is assigned     |
