import { v4 as uuidv4 } from "uuid";

export const ActionType = {
  redirect: "redirect",
} as const;

type Action<Name extends keyof typeof ActionType, Payload extends {}> = {
  payload: Payload;
  type: Name;
};

type ActionWithId<Name extends keyof typeof ActionType, Payload extends {}> = {
  payload: Payload & { actionId: string };
  type: Name;
};

function withActionId<
  Name extends keyof typeof ActionType,
  Payload extends {},
  T extends Action<Name, Payload>
>(action: T): ActionWithId<Name, Payload> {
  const actionId = uuidv4();

  return {
    ...action,
    payload: {
      ...action.payload,
      actionId,
    },
  };
}

type RedirectPayload = {
  to: string;
  newTab?: boolean;
};
function Redirect(
  payload: RedirectPayload
): ActionWithId<"redirect", RedirectPayload> {
  return withActionId({
    payload,
    type: "redirect",
  });
}

export type Actions = ReturnType<typeof Redirect>;
export type ActionType = Actions["type"];
