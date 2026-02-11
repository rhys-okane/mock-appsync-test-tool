import { Response } from "express";
import { Invocation } from "../types/Invocation";

export const invocations: Invocation[] = [];
export const lambdasAwaitingPayloads: Response[] = [];

setInterval(() => {
  const now = Date.now();
  invocations.forEach((invocation) => {
    if (now - invocation.createdAt.getTime() > 60000) {
      invocation.status = "response-timeout";
    }
  });
}, 60000);
