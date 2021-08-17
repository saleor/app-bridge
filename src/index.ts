import { Actions } from "./actions";
import { app } from "./app";
import { EventType } from "./events";

export function createApp(targetDomain?: string) {
  let domain: string;

  if (targetDomain) {
    domain = targetDomain;
  } else {
    const url = new URL(window.location.href);
    domain = url.searchParams.get("domain") || "";
  }

  app.setState({ domain });

  /**
   * Dispatches Action to Saleor Dashboard.
   *
   * @param action - Action containing type and payload.
   * @returns Promise resolved when Action is successfully completed.
   */
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
    unsubscribeAll: app.unsubscribeAll,
    getState: app.getState,
  };
}

export default createApp;
