// TODO: Share this interface with the backend
export interface Invocation {
  lambdaEventId: string;
  payload: string;
  status: "pending" | "executing" | "failed" | "completed";
}
