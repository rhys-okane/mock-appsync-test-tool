import { io } from "socket.io-client";

export const socket = io({
  path: "/api/socket.io",
  timeout: 5000,
  transports: ["websocket"]
});
