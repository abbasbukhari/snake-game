const net = require("net");
const { IP, PORT } = require("./constants");

const connect = function () {
  const conn = net.createConnection({
    host: IP,
    port: PORT,
  });

  conn.setEncoding("utf8");

  conn.on("connect", () => {
    console.log("Successfully connected to the game server!");
    conn.write("w");  // Initially sending a "move up" command
  });

  conn.on("error", (err) => {
    console.error("Connection error:", err.message);
  });

  return conn;
};

module.exports = { connect };
