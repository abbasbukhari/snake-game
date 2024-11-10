const net = require("net");
const { PORT, IP } = require("./constants");

const connections = []; // Stores client connections
const gridSize = 10; // Grid size (10x10)
let food = generateFood(); // Initial food placement
let gameState = initializeGameState(); // Initialize game state

// Create the server
const server = net.createServer((connection) => {
  console.log("New client connected!");

  // Send a welcome message
  connection.write("Welcome to Snake! Use 'w', 'a', 's', 'd' to move.\n");

  // Store the connection
  connections.push(connection);

  // Handle incoming data (key presses)
  connection.on("data", (data) => {
    handleUserInput(data, connection);
  });

  // Handle client disconnect
  connection.on("end", () => {
    console.log("Client disconnected.");
    const index = connections.indexOf(connection);
    if (index !== -1) {
      connections.splice(index, 1);
    }
  });

  // Send initial game state to the new client
  connection.write(renderGameBoard());

  // Simple game loop - Update every 200ms
  setInterval(() => {
    updateGameState();
    broadcast(renderGameBoard());
  }, 200);

  // Handle connection errors
  connection.on("error", (err) => {
    console.error("Connection error:", err.message);
  });
});

// Handle user input for controlling the snake
function handleUserInput(data, connection) {
  const direction = data.toString().trim().toLowerCase(); // Convert input to lowercase

  if (["w", "a", "s", "d"].includes(direction)) {
    const player = gameState.players[connections.indexOf(connection)];
    player.direction = direction;
  }
}

// Update the game state
function updateGameState() {
  gameState.players.forEach((player) => {
    moveSnake(player);
    if (checkCollision(player)) {
      player.alive = false; // End the game for the player if they collide
    } else {
      checkFoodCollision(player);
    }
  });
}

// Move the snake based on the direction
function moveSnake(player) {
  const head = { ...player.snake[0] };

  // Move the snake based on the direction
  if (player.direction === "w") head.y -= 1;
  if (player.direction === "a") head.x -= 1;
  if (player.direction === "s") head.y += 1;
  if (player.direction === "d") head.x += 1;

  player.snake.unshift(head); // Add new head
  player.snake.pop(); // Remove tail to simulate movement
}

// Check for wall or self-collision
function checkCollision(player) {
  const head = player.snake[0];
  if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
    return true; // Collided with the wall
  }
  for (let i = 1; i < player.snake.length; i++) {
    if (head.x === player.snake[i].x && head.y === player.snake[i].y) {
      return true; // Collided with itself
    }
  }
  return false;
}

// Check if the snake has eaten food
function checkFoodCollision(player) {
  const head = player.snake[0];
  if (head.x === food.x && head.y === food.y) {
    player.snake.push({ ...player.snake[player.snake.length - 1] }); // Grow the snake
    food = generateFood(); // Generate new food
  }
}

// Render the game board as a string
function renderGameBoard() {
  let board = "";
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      let cell = " ";
      gameState.players.forEach((player) => {
        player.snake.forEach((segment) => {
          if (segment.x === x && segment.y === y) {
            cell = "S"; // Snake
          }
        });
      });
      if (food.x === x && food.y === y) {
        cell = "*"; // Food
      }
      board += cell;
    }
    board += "\n";
  }
  return board;
}

// Generate food at a random position
function generateFood() {
  const x = Math.floor(Math.random() * gridSize);
  const y = Math.floor(Math.random() * gridSize);
  return { x, y };
}

// Initialize the game state with two players
function initializeGameState() {
  return {
    players: [
      { snake: [{ x: 2, y: 2 }], direction: "d", alive: true },  // Player 1
      { snake: [{ x: 7, y: 7 }], direction: "a", alive: true }   // Player 2
    ]
  };
}

// Broadcast the game board to all clients
function broadcast(data) {
  connections.forEach((conn) => {
    if (conn.writable) {
      conn.write(data);
    }
  });
}

// Start the server on the specified port
server.listen(PORT, IP, () => {
  console.log(`Server is running on ${IP}:${PORT}`);
});
