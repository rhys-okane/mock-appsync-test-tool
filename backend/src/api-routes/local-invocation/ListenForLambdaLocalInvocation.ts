import { Application } from "express";
import { invokeLambdaFromQueue } from "../../shared/InvokeLambdaFromQueue";
import { invocations, lambdasAwaitingPayloads } from "../../state/State";
import { Invocation } from "../../types/Invocation";
import { v4 as uuid } from "uuid";
import {Server} from "socket.io";

export const listenForLambdaLocalInvocation = (
  app: Application,
  io: Server,
) => {
  app.post("/invoke", (req, res) => {
    const { payload } = req.body as { payload: string };

    const lambdaEventId = uuid();
    const invocation: Invocation = {
      lambdaEventId,
      payload,
      status: "pending",
    };

    invocations.push(invocation);
    console.log(`New invocation added with ID: ${lambdaEventId}`);

    res.status(200).json(invocation);
    // For other clients to see the new invocation
    io.emit("invocationAdded", invocation);

    console.log(`Notified frontend of invocation ID: ${lambdaEventId}`);

    if (lambdasAwaitingPayloads.length === 0) {
      console.log(
        `No lambdas waiting for payloads, invocation ID: ${lambdaEventId} will be processed later.`,
      );
      return;
    }

    // Notify any waiting lambdas that a new invocation is available
    invokeLambdaFromQueue(invocation);
    console.log(
      `Sent payload to waiting lambda for invocation ID: ${lambdaEventId}`,
    );
  });
};
