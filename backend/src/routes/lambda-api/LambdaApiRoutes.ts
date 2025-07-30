import { Application, Router } from "express";
import { invocations, lambdasAwaitingPayloads } from "../../state/State";
import { Server } from "socket.io";

export const listenOnLambdaApiRoutes = (app: Application, io: Server) => {
  const router = Router();
  app.use("/2018-06-01", router);

  router.get("/runtime/invocation/next", (req, res) => {
    console.log("the lambda asked to be invoked");

    if (invocations.length === 0) {
      console.log("No invocations available, adding to waiting list");
      lambdasAwaitingPayloads.push(res);
      return;
    }

    const invocation = invocations.shift()!;

    const id = invocation.lambdaEventId;
    res
      .status(200)
      .set({
        "Lambda-Runtime-Aws-Request-Id": id,
        "Lambda-Runtime-Deadline-Ms": Date.now() + 30000,
        "Lambda-Runtime-Invoked-Function-Arn":
          "arn:aws:lambda:us-east-1:123456789012:function:my-function",
        "Lambda-Runtime-Trace-Id": id,
      })
      .send(invocation.payload);

    invocation.status = "executing";
    console.log(`Invocation ${id} sent to lambda`);
  });

  router.post("/runtime/invocation/:invocationId/:type", (req, res) => {
    if (req.params.type !== "response" && req.params.type !== "failure") {
      console.error("Invalid type provided");
      return res.status(400).send("Bad Request: Invalid type provided");
    }

    // TODO: Make a proper function for type narrowing this
    const type = req.params.type as "response" | "failure";

    console.log("the lambda sent a response of type " + type);

    if (!req.params.invocationId) {
      console.error("No invocation ID provided");
      return res.status(400).send("Bad Request: No invocation ID provided");
    }

    const invocationId = req.params.invocationId;
    const invocation = invocations.find(
      (inv) => inv.lambdaEventId === invocationId,
    );
    if (!invocation) {
      console.error(`No invocation found with ID: ${invocationId}`);
      return res.status(404).send("Not Found: Invocation not found");
    }

    if (invocation.status !== "executing") {
      console.error(`Invocation ${invocationId} is not in executing state`);
      return res
        .status(400)
        .send("Bad Request: Invocation not in executing state");
    }

    // If we reach this point, the invocation is in the correct state
    invocation.status = type === "response" ? "success" : "failure";
    console.log(`Invocation ${invocationId} completed successfully`);
    res.status(204).send();

    io.emit("invocationCompleted", invocation);
  });
};
