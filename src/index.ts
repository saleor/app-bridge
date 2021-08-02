import { Action, ActionType } from './actions';

// root state
type State = {
  token?: string;
  ready: boolean;
  domain: string;
};

type EventCallback = (data: any) => void;
type SubscribeMap = Record<ActionType, Record<string, EventCallback>>;

function reducer(state: State, action: Action, subscribeMap: SubscribeMap) {
  switch (action.type) {
    case 'handshake': {
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
  }
}

const app = (() => {
  let state: State = {
    domain: '',
    ready: false,
  };
  const subscribeMap: SubscribeMap = {
    handshake: {},
  };

  window.addEventListener('message', (e: { data: Action }) => {
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
    domain = url.searchParams.get('domain') || '';
  }

  app.setState({ domain });

  function dispatch(message: Action) {
    if (!!window.parent) {
      window.parent.postMessage(message, '*');
    }
  }

  return {
    dispatch,
    subscribe: app.subscribe,
    getState: app.getState,
  };
}
