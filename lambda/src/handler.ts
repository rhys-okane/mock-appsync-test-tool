import { Amplify } from "aws-amplify";
import { AppSyncResolverEvent } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { events } from "aws-amplify/data";

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

interface EventWrapper {
  type: "data";
  event: {
    status: "response" | "failure";
    payload: string;
  };
}

export const handler = async (
  event: AppSyncResolverEvent<string>,
): Promise<unknown> => {
  // eslint-disable-next-line no-async-promise-executor
  return await new Promise<string>(async (resolve, reject) => {
    console.log(
      "Received AppSync request for:",
      `${event.info.parentTypeName}.${event.info.fieldName}`,
    );

    const responseId = uuid();

    events.connect(`/default/${responseId}`).then((channel) => {
      channel.subscribe({
        next: (data: EventWrapper) => {
          console.log("Received response:", data.event.payload);

          resolve(JSON.parse(data.event.payload));
        },
        error: (error: Error) => {
          console.error("Error receiving response:", error);
          reject(error);
        },
      });
    });

    events
      .post("/default/appsync-lambda-invokes", {
        lambdaEventId: responseId,
        // TypeScript cannot properly introspect the AppSync event payload to determine if it is JSON stringifyable for the payload type
        payload: event as never,
      })
      .then(() => {
        console.log("Posted event to channel:", responseId);
      });
  });
};
