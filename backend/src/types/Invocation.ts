
export interface Invocation {
  lambdaEventId: string;
  payload: string;
  status: "pending" | "executing" | "failure" | "success";
}

export interface CompletedInvocation extends Invocation {
  status: "success" | "failure";
  responsePayload: string;
}
