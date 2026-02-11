import { Application, Router } from "express";
import { invocations } from "../../state/State";
import { Invocation } from "../../types/Invocation";
import EventEmitter from "node:events";
import { events } from "aws-amplify/data";
import { Response } from "express";
import { newLambdaConnectionEventEmitter } from "../../lambda-event-queue/LambdaConnectionEventQueue";
import { SocketServer } from "../../socket.io/types/SocketServer";

export const lambdaResponseEventEmitter = new EventEmitter();

export const listenOnLambdaRuntimeApiRoutes = (
  app: Application,
  io: SocketServer,
) => {
  const router = Router();
  app.use("/2018-06-01", router);

  router.get("/runtime/invocation/next", (req, res) => {
    newLambdaConnectionEventEmitter.emit("lambdaConnected", res);
  });

  router.post("/runtime/invocation/:invocationId/:type", (req, res) => {
    if (req.params.type !== "response" && req.params.type !== "failure") {
      console.error("Invalid type provided");
      return res.status(400).send("Bad Request: Invalid type provided");
    }

    // TODO: Make a proper function for type narrowing this
    const type = req.params.type as "response" | "failure";

    if (!req.params.invocationId) {
      console.error("No invocation ID provided");
      return res.status(400).send("Bad Request: No invocation ID provided");
    }

    const invocationId = req.params.invocationId;

    const invocationIndex = invocations.findIndex(
      (inv) => inv.lambdaEventId === invocationId,
    );

    if (invocationIndex === -1) {
      console.error(`No invocation found with ID: ${invocationId}`);
      return res.status(404).send("Not Found: Invocation not found");
    }

    const invocation = invocations[invocationIndex];

    if (invocation.status === "success" || invocation.status === "failure") {
      errorHandler(
        `Invocation ${invocationId} has already been executed`,
        invocation,
        res,
      );
      return;
    }

    // If we reach this point, the invocation is in the correct state
    const updatedInvocation: Invocation = {
      ...invocation,
      status: type === "response" ? "success" : "failure",
      responsePayload: JSON.stringify(req.body, null, 2),
    };

    invocations[invocationIndex] = updatedInvocation;

    console.log(
      `[Invoke] Invocation ${invocationId} completed with status ${updatedInvocation.status}`,
    );
    res.status(204).send();

    io.emit("invocationCompleted", updatedInvocation);
    lambdaResponseEventEmitter.emit("invocationCompleted", updatedInvocation);

    if (invocation.origin === "appsync") {
      console.log(updatedInvocation.responsePayload);
      // Post the response back to the AppSync channel
      events
        .post(`/default/${invocation.lambdaEventId}`, {
          status: type,
          payload: updatedInvocation.responsePayload,
        })
        .then(() => {
          console.log("Successfully posted response to AppSync channel");
        })
        .catch((err) => {
          console.error("Failed to post response to AppSync channel:", err);
        });
    }
  });
};

function errorHandler(error: string, invocation: Invocation, res: Response) {
  console.error("Error during invocation:", error);

  res.status(500).send("Internal Server Error: " + error);

  if (invocation.origin === "appsync") {
    events.post(`/default/${invocation.lambdaEventId}`, {
      status: "error",
      payload: JSON.stringify({
        error: error,
      }),
    });
  }
}
