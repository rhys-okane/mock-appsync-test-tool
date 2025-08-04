import { lambdasAwaitingPayloads } from "../state/State";
import { Invocation } from "../types/Invocation";

export const invokeLambdaFromQueue = (invocation: Invocation) => {
  const availableLambda = lambdasAwaitingPayloads.shift();
  if (!availableLambda) {
    throw new Error("No available lambda to invoke");
  }

  const id = invocation.lambdaEventId;

  invocation.status = "executing";

  availableLambda
    .status(200)
    .set({
      "Lambda-Runtime-Aws-Request-Id": id,
      "Lambda-Runtime-Deadline-Ms": Date.now() + 30000,
      "Lambda-Runtime-Invoked-Function-Arn":
        "arn:aws:lambda:us-east-1:123456789012:function:my-function",
      "Lambda-Runtime-Trace-Id": id,
    })
    .send(invocation.payload);

  console.log(`Invocation ${id} sent to lambda`);
};
