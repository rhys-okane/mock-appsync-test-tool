import { Amplify } from "aws-amplify";
import { events } from "aws-amplify/data";
import { Invocation } from "../types/Invocation";
import { AppSyncResolverEvent } from "aws-lambda";
import { invocations } from "../state/State";
import { invokeLambdaFromQueue } from "../shared/InvokeLambdaFromQueue";

interface ChannelEventWrapper {
  type: "data";
  event: {
    lambdaEventId: string;
    payload: AppSyncResolverEvent<unknown>;
  };
}

export async function listenForAppSyncEvents() {
  if (
    !process.env.APPSYNC_EVENTS_API_URL ||
    !process.env.APPSYNC_EVENTS_REGION ||
    !process.env.APPSYNC_EVENTS_API_KEY
  ) {
    throw new Error(
      "Missing required environment variables for AppSync events API configuration.",
    );
  }

  Amplify.configure({
    API: {
      Events: {
        endpoint: process.env.APPSYNC_EVENTS_API_URL,
        region: process.env.APPSYNC_EVENTS_REGION,
        defaultAuthMode: "apiKey",
        apiKey: process.env.APPSYNC_EVENTS_API_KEY,
      },
    },
  });

  const channel = await events.connect("/default/appsync-lambda-invokes");
  console.log(
    "Listening for AppSync events on channel: /default/appsync-lambda-invokes",
  );

  channel.subscribe({
    next: async (data: ChannelEventWrapper) => {
      console.log(
        "Received AppSync event for field:",
        `${data.event.payload.info.parentTypeName}.${data.event.payload.info.fieldName}`,
      );

      const invocation: Invocation = {
        lambdaEventId: data.event.lambdaEventId,
        payload: JSON.stringify(data.event.payload),
        status: "pending",
        origin: "appsync",
      };

      invocations.push(invocation);
      try {
        invokeLambdaFromQueue(invocation);
      } catch {
        console.error(`[ERROR] Failed to invoke lambda ${invocation.lambdaEventId} from queue - no handlers available`);
        await events.post(`/default/${data.event.lambdaEventId}`, {
          status: "error",
          payload: JSON.stringify({
            error: "No lambda handlers available",
          }),
        });
      }
    },
    error: (error: Error) => {
      console.error("Error receiving AppSync event:", error);
    },
  });
}
