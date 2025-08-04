import { EventEmitter } from "stream";
import { invokeLambdaWithExpressResponse } from "../api-routes/lambda-runtime-api/utils/InvokeLambdaWithExpressResponse";
import { invocations, lambdasAwaitingPayloads } from "../state/State";
import { Invocation } from "../types/Invocation";
import { SocketServer } from "../socket.io/types/SocketServer";

type Events = {
  invoke: [Invocation];
};
export const lambdaInvocationEventEmitter = new EventEmitter<Events>();

export function handleLambdaInvocationEventQueue(io: SocketServer) {
  lambdaInvocationEventEmitter.on("invoke", (invocation: Invocation) => {
    console.log(`[Invoke] ${invocation.lambdaEventId} is available for Lambda`);

    const lambdaResponse = lambdasAwaitingPayloads.shift();
    if (lambdaResponse) {
      console.log(
        `[Invoke] Invoking Lambda with ID: ${invocation.lambdaEventId}`,
      );
      invokeLambdaWithExpressResponse(invocation, lambdaResponse);
      return;
    }

    console.log(
      `[Invoke] No Lambdas available, adding invocation ${invocation.lambdaEventId} to waiting list`,
    );

    invocations.push(invocation);

    io.emit("invocationAdded", invocation);
  });
}
