import * as net from "net";

function checkPort(port: number, callback: (isUsed: boolean) => void): void {
  const server = net.createServer();

  server.once("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      callback(true);
    } else {
      callback(false);
    }
  });

  server.once("listening", () => {
    server.close();
    callback(false);
  });

  server.listen(port);
}

export { checkPort };
