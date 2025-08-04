import http from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import { invocations } from "./state/State";
import { listenOnLambdaRuntimeApiRoutes } from "./api-routes/lambda-runtime-api/LambdaRuntimeApiRoutes";
import bodyParser from "body-parser";
import { listenForAppSyncEvents } from "./appsync-events/ListenForAppSyncEvents";
import { configDotenv } from "dotenv";
import {listenForLambdaLocalInvocation} from "./api-routes/local-invocation/ListenForLambdaLocalInvocation";
import path from "path";

configDotenv({
  path: [
    ".env",
    // Load top level .env file
    path.resolve(__dirname, "../../.env"),
  ]
});
console.log(path.resolve(__dirname, "../../.env"))

const app = express();

app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  }),
);

const server = http.createServer(app);
const io = new Server(server, {
  path: "/socket.io",
});

listenOnLambdaRuntimeApiRoutes(app, io);
listenForLambdaLocalInvocation(app, io);
listenForAppSyncEvents();

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
