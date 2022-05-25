import { Values } from "./helpers";

export type Version = 1;

export const EventType = {
  handshake: "handshake",
  response: "response",
} as const;
export type EventType = Values<typeof EventType>;

type Event<Name extends EventType, Payload extends {}> = {
  payload: Payload;
  type: Name;
};

export type HandshakeEvent = Event<
  "handshake",
  {
    token: string;
    version: Version;
  }
>;

export type DispatchResponseEvent = Event<
  "response",
  {
    actionId: string;
    ok: boolean;
  }
>;

// TODO: Add Theme event
// type ThemeEvent = Event<
//   "theme",
//   {
//     theme: "light" | "dark";
//   }
// >;

export type Events = HandshakeEvent | DispatchResponseEvent;
export type PayloadOfEvent<
  TEventType extends EventType,
  TEvent extends Events = Events> = TEvent extends Event<TEventType, any> ? TEvent["payload"] : never;