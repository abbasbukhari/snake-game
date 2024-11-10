// play.js
const { connect } = require("./client");
const { setupInput } = require("./input");

// Inform the user that the client is attempting to connect
console.log("Connecting to the game server...");

// Establish connection to the server
const connection = connect();

// Set up user input handling once connected
setupInput(connection);
