type Version = 1;

export const EventType = {
  handshake: "handshake",
  response: "response",
} as const;

type Event<Name extends keyof typeof EventType, Payload extends {}> = {
  payload: Payload;
  type: Name;
};

type HandshakeEvent = Event<
  "handshake",
  {
    token: string;
    version: Version;
  }
>;

type DispatchResponseEvent = Event<
  "response",
  {
    actionId: string;
    ok: boolean;
  }
>;

// type ThemeEvent = Event<
//   "theme",
//   {
//     theme: "light" | "dark";
//   }
// >;

export type Events = HandshakeEvent | DispatchResponseEvent;
export type EventType = Events["type"];
export type PayloadOfEvent<
  TEventType extends EventType,
  TEvent extends Events = Events
> = TEvent extends { type: TEventType } ? TEvent["payload"] : never;
