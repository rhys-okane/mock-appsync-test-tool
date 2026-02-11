interface BaseInvocation {
  lambdaEventId: string;
  payload: string;
  status: "pending" | "executing" | "failure" | "success" | "response-timeout";

  origin: "appsync" | "api";
  createdAt: Date;
}

export interface IncompleteInvocation extends BaseInvocation {
  status: "pending" | "executing" | "response-timeout";
}

export interface CompletedInvocation extends BaseInvocation {
  status: "success" | "failure";
  responsePayload: string;
}

export type Invocation = IncompleteInvocation | CompletedInvocation;
