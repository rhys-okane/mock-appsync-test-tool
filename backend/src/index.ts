import http from "http";
import { Server } from "socket.io";
import express from "express";
import { v4 as uuid } from "uuid";
import cors from "cors";
import { invocations, lambdasAwaitingPayloads } from "./state/State";
import { Invocation } from "./types/Invocation";
import { listenOnLambdaApiRoutes } from "./routes/lambda-api/LambdaApiRoutes";
import bodyparser from "body-parser";
import { handleGraphQL } from "./routes/graphql/GraphQL";
import { invokeLambdaFromQueue } from "./shared/InvokeLambdaFromQueue";
const app = express();

const port = 5050;

app.use(bodyparser.json());
app.use(
  cors({
    origin: "*",
  }),
);

const server = http.createServer(app);
const io = new Server(server, {
  path: "/socket.io",
});

listenOnLambdaApiRoutes(app, io);
// handleGraphQL(app);

app.post("/invoke", (req, res) => {
  const { payload } = req.body as { payload: string };

  const lambdaEventId = uuid();
  const invocation: Invocation = {
    lambdaEventId,
    payload,
    status: "pending",
  };

  invocations.push(invocation);
  console.log(invocations);
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

io.on("connection", (socket) => {
  console.log("Frontend connected");

  socket.emit("welcome", invocations);

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

server.listen(port, () => {
  console.log(`Mock AppSync Test Tool listening at http://localhost:${port}`);
});
