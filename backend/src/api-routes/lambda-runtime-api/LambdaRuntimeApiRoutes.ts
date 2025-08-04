import { Application, Router } from "express";
import { invocations, lambdasAwaitingPayloads } from "../../state/State";
import { Server } from "socket.io";
import { invokeLambdaWithExpressResponse } from "./utils/InvokeLambdaWithExpressResponse";
import { Invocation } from "../../types/Invocation";
import EventEmitter from "node:events";
import { events } from "aws-amplify/data";
import {Response} from "express";

export const lambdaResponseEventEmitter = new EventEmitter();

export const listenOnLambdaRuntimeApiRoutes = (app: Application, io: Server) => {
  const router = Router();
  app.use("/2018-06-01", router);

  router.get("/runtime/invocation/next", (req, res) => {
    console.log("the lambda asked to be invoked");

    const invocation = invocations.find((inv) => inv.status === "pending");

    if (!invocation) {
      console.log("No invocations available, adding to waiting list");
      lambdasAwaitingPayloads.push(res);
      return;
    }
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
      errorHandler(
        `Invocation ${invocationId} is not in the executing state`,
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

    invocations[invocations.indexOf(invocation)] = updatedInvocation;

    console.log(`Invocation ${invocationId} completed`);
    res.status(204).send();

    io.emit("invocationCompleted", updatedInvocation);
    lambdaResponseEventEmitter.emit("invocationCompleted", updatedInvocation);

    if (invocation.origin === "appsync") {
      console.log(updatedInvocation.responsePayload)
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
    events
    .post(`/default/${invocation.lambdaEventId}`, {
      status: "error",
      payload: JSON.stringify({
        error: error,
      })
    })
  }
}
