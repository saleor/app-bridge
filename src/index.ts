import { Action, ActionType } from "./actions";

type State = {
  token?: string;
  ready: boolean;
  domain: string;
};

type EventCallback = (data: State) => void;
type SubscribeMap = Record<ActionType, Record<string, EventCallback>>;

function reducer(state: State, action: Action, subscribeMap: SubscribeMap) {
  switch (action.type) {
    case "handshake": {
      const newState = {
        ...state,
        ready: true,
        token: action.payload.token,
      };

      Object.getOwnPropertySymbols(subscribeMap.handshake).forEach(key =>
        subscribeMap.handshake[key as any](newState)
      );

      return newState;
    }
    default: {
      return state;
    }
  }
}

const app = (() => {
  let state: State = {
    domain: "",
    ready: false,
  };
  const subscribeMap: SubscribeMap = {
    handshake: {},
  };

  let refererOrigin: string;
  try {
    refererOrigin = new URL(document.referrer).origin;
  } catch (e) {
    console.warn("document.referrer is empty");
  }

  window.addEventListener("message", e => {
    if (e.origin !== refererOrigin) {
      return;
    }
    state = reducer(state, e.data, subscribeMap);
  });

  function subscribe(type: ActionType, cb: EventCallback) {
    const key = (Symbol() as unknown) as string; // https://github.com/Microsoft/TypeScript/issues/24587
    subscribeMap[type][key] = cb;

    return () => {
      delete subscribeMap[type][key];
    };
  }

  function getState() {
    return state;
  }

  function setState(newState: Partial<State>) {
    state = {
      ...state,
      ...newState,
    };

    return state;
  }

  return {
    subscribe,
    getState,
    setState,
  };
})();

export function createApp(targetDomain?: string) {
  let domain: string;

  if (targetDomain) {
    domain = targetDomain;
  } else {
    const url = new URL(window.location.href);
    domain = url.searchParams.get("domain") || "";
  }

  app.setState({ domain });

  // actions to be defined
  function dispatch(message: unknown) {
    if (!!window.parent) {
      window.parent.postMessage(message, "*");
    }
  }

  return {
    dispatch,
    subscribe: app.subscribe,
    getState: app.getState,
  };
}
