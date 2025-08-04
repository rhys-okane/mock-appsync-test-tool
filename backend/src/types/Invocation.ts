interface BaseInvocation {
  lambdaEventId: string;
  payload: string;
  status: "pending" | "executing" | "failure" | "success";

  origin?: "appsync"
}

export interface IncompleteInvocation extends BaseInvocation {
  status: "pending" | "executing";
}

export interface CompletedInvocation extends BaseInvocation {
  status: "success" | "failure";
  responsePayload: string;
}

export type Invocation = IncompleteInvocation | CompletedInvocation;
