import { Response } from "express";
import { EventEmitter } from "stream";
import { invokeLambdaWithExpressResponse } from "../api-routes/lambda-runtime-api/utils/InvokeLambdaWithExpressResponse";
import { invocations, lambdasAwaitingPayloads } from "../state/State";

type Events = {
  lambdaConnected: [Response];
};
export const newLambdaConnectionEventEmitter = new EventEmitter<Events>();

export function handleLambdaConnectionEventQueue() {
  // Emitted when a lambda hits the /runtime/invocation/next endpoint
  newLambdaConnectionEventEmitter.on("lambdaConnected", (res: Response) => {
    console.log("[Lambda] Lambda connected, checking for invocations...");
    const invocation = invocations.find((inv) => inv.status === "pending");
    if (invocation) {
      invocations.splice(invocations.indexOf(invocation), 1);

      console.log(
        `[Lambda] Invocation ${invocation.lambdaEventId} is available for new lambda, invoking...`,
      );
      // Invoke the lambda with the response object
      invokeLambdaWithExpressResponse(invocation, res);
      return;
    }

    console.log("[Lambda] No invocations available, adding to waiting list");
    lambdasAwaitingPayloads.push(res);
  });
}
