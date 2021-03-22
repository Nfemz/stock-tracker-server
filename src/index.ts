import { subscribeSubredditPost } from "./utils";

const express = require("express");
const enableWs = require("express-ws");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors(), bodyParser.json());
enableWs(app);

const PORT = 9000;

app.ws("/subscribe/reddit", (ws: any, req: any) => {
  ws.send(
    JSON.stringify([
      {
        message: "Connected to reddit thread poll websocket successfully.",
        type: "message",
      },
    ])
  );

  ws.on("message", (event: any) => {
    const data = JSON.parse(event).data;
    subscribeSubredditPost(data.url, ws);
  });
});

app.listen(PORT, () => console.info(`Server listening on Port:${PORT}`));
