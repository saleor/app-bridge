type HandshakeAction = {
  payload: {
    token: string;
  };
  type: 'handshake';
};

// type ThemeAction = {
//   payload: {
//     theme: "light" | "dark";
//   }
//   type: "redirect"
// }

export type Action = HandshakeAction;
export type ActionType = Action['type'];
