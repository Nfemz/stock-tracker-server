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
  const { url } = req.body;
  subscribeSubredditPost(url, ws);
});
