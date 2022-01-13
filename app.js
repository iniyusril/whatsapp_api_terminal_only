import {
  WAConnection,
  ReconnectMode,
  waChatKey,
  MessageType,
} from "@adiwajshing/baileys";
import * as fs from "fs";
import express from "express";

const conn = new WAConnection(); // instantiate

conn.autoReconnect = ReconnectMode.onConnectionLost; // only automatically reconnect when the connection breaks
conn.logger.level = "debug"; // set to 'debug' to see what kind of stuff you can implement
// attempt to reconnect at most 10 times in a row
conn.connectOptions.maxRetries = 10;
conn.chatOrderingKey = waChatKey(true); // order chats such that pinned chats are on top

var isSentData = false;
function isSent() {
  return new Promise((resolve) => {
    setTimeout(() => {}, 1000);
    resolve(isSentData);
  });
}
conn.on("chats-received", async ({ hasNewChats }) => {
  console.log("sent");
  isSentData = hasNewChats;
});

conn.on("contacts-received", () => {
  console.log(`you have ${Object.keys(conn.contacts).length} contacts`);
});
conn.on("initial-data-received", () => {
  console.log("received all initial messages");
});

// loads the auth file credentials if present
/*  Note: one can take this auth_info.json file and login again from any computer without having to scan the QR code, 
    and get full access to one's WhatsApp. Despite the convenience, be careful with this file */
fs.existsSync("./auth_info.json") && conn.loadAuthInfo("./auth_info.json");
// uncomment the following line to proxy the connection; some random proxy I got off of: https://proxyscrape.com/free-proxy-list
//conn.connectOptions.agent = ProxyAgent ('http://1.0.180.120:8080')
await conn.connect();
// credentials are updated on every connect
const authInfo = conn.base64EncodedAuthInfo(); // get all the auth info we need to restore this session
fs.writeFileSync("./auth_info.json", JSON.stringify(authInfo, null, "\t")); // save this info to a file

console.log("oh hello " + conn.user.name + " (" + conn.user.jid + ")");

/* example of custom functionality for tracking battery */
conn.on("CB:action,,battery", (json) => {
  const batteryLevelStr = json[2][0][1].value;
  const batterylevel = parseInt(batteryLevelStr);
  console.log("battery level: " + batterylevel);
});
conn.on("close", ({ reason, isReconnecting }) =>
  console.log(
    "oh no got disconnected: " + reason + ", reconnecting: " + isReconnecting
  )
);

const app = express();
const PORT = 8000;


app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

var standartResponse = {
  success: false,
  message: "",
  data: {},
};

app.get("/", (req, res) => res.send("Express + TypeScript Server"));

app.post("/api/v1/send-message", async function (req, res) {
  var number = req.body.number;
  var message = req.body.message;

  console.log("panjang", number.length, isNaN(number), req.headers);

  if (req.headers["x-api-key"] !== process.env.API_KEY) {
    var response = standartResponse;
    response.message = "unauthorized";
    res.status(401).json(response);
    return;
  }

  if (number.length > 15 || isNaN(number)) {
    var response = standartResponse;
    response.message = "number invalid";
    res.status(500).json(response);
    return;
  }
  var id = `${number}@s.whatsapp.net`;

  await conn.sendMessage(id, message, MessageType.text);
  var response = standartResponse;
  response.success = true;
  response.message = "Success";
  response.data = "Sent";
  res.json(response);
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
