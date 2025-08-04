import http from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import { invocations } from "./state/State";
import { listenOnLambdaRuntimeApiRoutes } from "./api-routes/lambda-runtime-api/LambdaRuntimeApiRoutes";
import bodyParser from "body-parser";
import { listenForAppSyncEvents } from "./appsync-events/ListenForAppSyncEvents";
import { configDotenv } from "dotenv";
import { listenForLambdaLocalInvocation } from "./api-routes/local-invocation/ListenForLambdaLocalInvocation";
import path from "path";
import { handleLambdaConnectionEventQueue } from "./lambda-event-queue/LambdaConnectionEventQueue";
import { handleLambdaInvocationEventQueue } from "./lambda-event-queue/LambdaInvocationEventQueue";
import { ServerToClientEvents } from "./socket.io/types/SocketServer";

configDotenv({
  path: [
    ".env",
    // Load top level .env file
    path.resolve(__dirname, "../../.env"),
  ],
});

const app = express();

app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  }),
);

const server = http.createServer(app);

const io = new Server<never, ServerToClientEvents>(server, {
  path: "/socket.io",
});

listenOnLambdaRuntimeApiRoutes(app, io);
listenForLambdaLocalInvocation(app);
listenForAppSyncEvents();

handleLambdaConnectionEventQueue();
handleLambdaInvocationEventQueue(io);

io.on("connection", (socket) => {
  console.log("Frontend connected");

  socket.emit("welcome", invocations);

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

const port = Number(process.env.LAMBDA_SERVICE_PORT ?? 5050);
server.listen(port, () => {
  console.log(`Mock AppSync Test Tool listening at http://localhost:${port}`);
});
