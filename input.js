const setupInput = (conn) => {
  const stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.setEncoding("utf8");
  stdin.resume();

  stdin.on("data", (key) => handleUserInput(key, conn));

  return stdin;
};

const handleUserInput = (key, conn) => {
  if (key === "\u0003") { // Ctrl+C to exit
    console.log("Exiting the game.");
    process.exit();
  }

  const moveCommands = {
    w: "w",
    a: "a",
    s: "s",
    d: "d",
  };

  if (moveCommands[key]) {
    conn.write(moveCommands[key]);  // Send the movement command to the server
  }
};

module.exports = { setupInput };
