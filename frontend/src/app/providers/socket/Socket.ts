import { io } from "socket.io-client";
import {API_BASE_URL} from "../../../api/constants/API";

export const socket = io(API_BASE_URL,{
  path: `/socket.io`,
  timeout: 5000,
  transports: ["websocket"]
});
