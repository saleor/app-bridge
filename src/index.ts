import { SSR } from "./constants";
import { Actions } from "./actions";
import { Events, EventType, PayloadOfEvent } from "./events";

type State = {
  token?: string;
  ready: boolean;
  domain: string;
};

type EventCallback<TPayload extends {} = {}> = (data: TPayload) => void;
type SubscribeMap = {
  [type in EventType]: Record<any, EventCallback<PayloadOfEvent<type>>>;
};

function reducer(state: State, event: Events) {
  switch (event.type) {
    case EventType.handshake: {
      const newState = {
        ...state,
        ready: true,
        token: event.payload.token,
      };

      return newState;
    }
    default: {
      return state;
    }
  }
}

const app = (() => {
  if (SSR) {
    console.warn(
      "@saleor/app-bridge detected you're running this app in SSR mode. Make sure to call `createApp` when window object exists."
    );
    return null as never;
  }

  let state: State = {
    domain: "",
    ready: false,
  };
  const subscribeMap: SubscribeMap = {
    handshake: {},
    response: {},
  };

  let refererOrigin: string;
  try {
    refererOrigin = new URL(document.referrer).origin;
  } catch (e) {
    console.warn("document.referrer is empty");
  }

  window.addEventListener(
    "message",
    // Generic MessageEvent is not supported by tsdx's TS version
    ({ origin, data }: Omit<MessageEvent, "data"> & { data: Events }) => {
      // check if event origin matches the document referer
      if (origin !== refererOrigin) {
        return;
      }

      // run callbacks
      const { type, payload } = data;
      if (EventType.hasOwnProperty(type)) {
        Object.getOwnPropertySymbols(subscribeMap[type]).forEach(key =>
          // @ts-ignore
          subscribeMap[type][key](payload)
        );
      }

      // compute new state
      state = reducer(state, data);
    }
  );

  function subscribe<
    TEventType extends EventType,
    TPayload extends PayloadOfEvent<TEventType>
  >(type: TEventType, cb: EventCallback<TPayload>) {
    const key = (Symbol() as unknown) as string; // https://github.com/Microsoft/TypeScript/issues/24587
    // @ts-ignore
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

  async function dispatch<T extends Actions>(action: T) {
    return new Promise<void>((resolve, reject) => {
      if (!!window.parent) {
        window.parent.postMessage(
          {
            type: action.type,
            payload: action.payload,
          },
          "*"
        );

        let intervalId: NodeJS.Timer;

        const unsubscribe = app.subscribe(
          EventType.response,
          ({ actionId, ok }) => {
            if (action.payload.actionId === actionId) {
              unsubscribe();
              clearInterval(intervalId);

              if (ok) {
                resolve();
              } else {
                reject(
                  "Error: Action responded with negative status. This indicates the action method was not used properly."
                );
              }
            }
          }
        );

        // If dashboard doesn't respond within 1 second, reject and unsubscribe
        intervalId = setInterval(() => {
          unsubscribe();
          reject("Error: Action response timed out.");
        }, 1000);
      } else {
        reject("Error: Parent window does not exist.");
      }
    });
  }

  return {
    dispatch,
    subscribe: app.subscribe,
    getState: app.getState,
  };
}
