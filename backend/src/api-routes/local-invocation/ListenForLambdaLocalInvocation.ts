import { Application } from "express";
import { v4 as uuid } from "uuid";
import { lambdaInvocationEventEmitter } from "../../lambda-event-queue/LambdaInvocationEventQueue";
import { Invocation } from "../../types/Invocation";

export const listenForLambdaLocalInvocation = (app: Application) => {
  app.post("/invoke", (req, res) => {
    const { payload } = req.body as { payload: string };

    const lambdaEventId = uuid();
    const invocation: Invocation = {
      lambdaEventId,
      payload,
      status: "pending",
      createdAt: new Date(),
      origin: "api",
    };

    lambdaInvocationEventEmitter.emit("invoke", invocation);

    res.status(200).json(invocation);
  });
};
