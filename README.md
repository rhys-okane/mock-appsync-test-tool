# Mock AppSync Test Tool

> A simple solution for interacting with AppSync Resolvers ran locally

## Requirements

- Node 22 or Later
  - Versions below this are unsupported but may still work - use at your own risk
- Manually deployed AWS AppSync Events API (not GraphQL)
- AppSync Resolver Lambda function using the [Lambda Runtime API](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-api.html)
  - Direct invocation is not supported - PRs welcome

## First Time Setup

- Install the tool with your package manager of choice
  - `npm install git@github.com:instil/mock-appsync-test-tool.git`
  - `pnpm install git@github.com:instil/mock-appsync-test-tool.git`
  - `yarn dlx git@github.com:instil/mock-appsync-test-tool.git`

- Run the local lambda listener
  - `npx mock-appsync-test-tool`
  - `yarn dlx mock-appsync-test-tool`
  - `pnpx mock-appsync-test-tool`

- Start your AppSync Resolver function locally
  - Set the `AWS_LAMBDA_RUNTIME_API` environment variable to `localhost:5050`
  - Run the lambda

- Deploy an AppSync Events API manually
  - Go to the AppSync console
  - Select `Create Event API`
  - Give it a nice name
  - Go to settings
  - Take note of it's API Key and HTTP DNS endpoint
    > [!NOTE]
    > The default API key expires 2 weeks after creation - consider creating a new key with a later expiry

- Replace your cloud AppSync Resolver function with a copy of the [listener lambda](./lambda)
  - Download the lambda handler from https://github.com/instil/mock-appsync-test-tool/releases
  - Set `runtime` to `node22.x`
  - Set the `handler` to `handler.handler`
  - Upload the `lambda.zip` file to the Lambda console
  - Set the following environment variables on the Lambda
    - `APPSYNC_EVENTS_API_URL=https://[your-events-api].appsync-api.[region].amazonaws.com/event`
      - Note the `/event` at the end, this may not be in the URL you copied from the console
    - `APPSYNC_EVENTS_API_KEY=[your-key]`
      > [!NOTE]
      > You should be able to automate this process with your IaC tool of choice

- OR write your own listener function
  - Follow the lead of the TypeScript lambda in [lambda/src/handler.ts](./lambda/src/handler.ts)

- Profit

## Interacting with your Local AppSync Resolver

Once everything is set up, you can interact with your AppSync the same way you normally would - via GraphQL!
Simply hit `https://[your-api].appsync-api.[region].amazonaws.com/graphql` from your app or use the AppSync console as normal.

In future, you can run `npx mock-appsync-test-tool` to restart the tool

## How it works

- Your app makes a call to AppSync
- AppSync calls your resolver
- Your resolver has been replaced by the listener function
- The listener function sends an AppSync event to the mock-appsync-test-tool
- The mock-appsync-test-tool forwards this event to your local lambda
- Your lambda responds to the mock-appsync-test-tool, which forwards the response to AppSync
- AppSync responds to your request as if it ran in the cloud

Limitations:

- Your AppSync will act as if it is running as your AWS user - this is likely more privileged than the role it will have when fully deployed. Make sure you test any changes to IAM roles in the cloud, not locally
- Killing the mock-appsync-test-tool will make your Lambda crash, you will have to restart it
