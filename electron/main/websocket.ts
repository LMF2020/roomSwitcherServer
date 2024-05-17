import http from "http";
import * as WebSocket from "ws";

const port = 4444;
const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws: WebSocket) => {
  //connection is up, let's add a simple simple event
  ws.on("message", (message: string) => {
    //log the received message and send it back to the client
    console.log("客户端传来的消息: %s", message);
    ws.send(`客户端传过来的消息，服务端已收到! -> ${message}`);
  });

  //send immediatly a feedback to the incoming connection
  ws.send("Hi there, I am a WebSocket server");
});

//start our server
server.listen(port, () => {
  console.log(`Data stream server started on port ${port}`);
});

// 错误异常
server.on("error", err => {
  console.error("服务器错误:", err.message)
})
// 服务器关闭事件监听
server.on("close", () => {
  console.log("服务器关闭!")
})