import { Server } from "socket.io";
import { Invocation } from "../../types/Invocation";

export interface ServerToClientEvents {
  welcome: (invocations: Invocation[]) => void;
  invocationAdded: (invocation: Invocation) => void;
  invocationCompleted: (updatedInvocation: Invocation) => void;
}

export type SocketServer = Server<never, ServerToClientEvents>;
