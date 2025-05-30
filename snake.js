const title = document.querySelector("h1");
const startBtn = document.getElementById("start-button");
const restartBtn = document.getElementById("restart-button");
const canvasCont = document.getElementById("canvas-container");
const scoreLayout = document.getElementById("score-layout");
const bgMusic = document.getElementById("bg-music");
const crashSound = document.getElementById("crash-sound");
const foodSound = document.getElementById("food-sound");
const eggSound = document.getElementById("egg-sound");
bgMusic.volume = 0.2;
crashSound.volume = 0.2;
foodSound.volume = 0.2;
eggSound.volume = 0.2;
title.style.display = "none";
canvasCont.classList.add("hidden");
scoreLayout.style.display = "none";
restartBtn.style.display = "none";

// Board
const square = 40; // default 40
const rows = 14; // default 10
const cols = 20; // default 15

const board = document.getElementById("board");
board.width = square * cols;
board.height = square * rows;
const ctx = board.getContext("2d");

// Snake head initial position
let snakeX = square * 2;
let snakeY = square * 2;

// Snake initial velocity
let velocityX = 0;
let velocityY = 0;

// Snake body
const snakeBody = [];

// Food
let foodX;
let foodY;

// Egg
let eggX;
let eggY;

// Score
let score = 0;

// Game over
let gameOver = false;

let gameLoop;

// Start Game
const startGame = () => {
  canvasCont.classList.remove("hidden");
  title.style.display = "flex";
  startBtn.style.display = "none";
  scoreLayout.style.display = "flex";
  canvasCont.style.cursor = "none";
  placeFood();
  bgMusic.play();
  displayHighScore();
  document.addEventListener("keydown", changeDirection);
  document.addEventListener("keyup", changeKeyColor);
  clearInterval(gameLoop);
  gameLoop = setInterval(update, 100);
};

const handleStartGame = (e) => {
  if (e.type === "click" || e.code === "Enter") {
    startGame();
    startBtn.removeEventListener("click", handleStartGame);
    document.removeEventListener("keydown", handleStartGame);
  }
};

startBtn.addEventListener("click", handleStartGame);
document.addEventListener("keydown", handleStartGame);

const handleRestartGame = (e) => {
  if (e.type === "click" || e.code === "KeyR" || e.code === "Enter") {
    resetGame();
    restartBtn.style.display = "none";
    document.removeEventListener("keydown", handleRestartGame);
    document.removeEventListener("click", handleRestartGame);
  }
};

// Update frames
const update = () => {
  if (gameOver) {
    saveHighScore(score);
    bgMusic.pause();
    canvasCont.style.cursor = "auto";
    document.removeEventListener("keydown", changeDirection);
    document.removeEventListener("keyup", changeKeyColor);
    restartBtn.style.display = "block";
    restartBtn.addEventListener("click", handleRestartGame);
    document.addEventListener("keydown", handleRestartGame);
    svgKeyW.classList.remove("pressStyle");
    svgKeyS.classList.remove("pressStyle");
    svgKeyD.classList.remove("pressStyle");
    svgKeyA.classList.remove("pressStyle");
    return;
  }

  // Background
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, board.width, board.height);

  // Food
  ctx.fillStyle = "#eb2d53";
  drawFood();

  // Egg
  ctx.fillStyle = "#f5f5dc";
  if (Math.floor(Date.now() / 300) % 2 === 0) {
    drawEgg();
  }

  // Take food
  if (snakeX === foodX && snakeY === foodY) {
    foodSound.play();
    snakeBody.push([foodX, foodY]);
    // Score layout actualizer
    score++;
    scoreLayout.textContent = `> score ${score}`;
    adjustSpeed(score);
    placeFood();
  }

  if (snakeX === eggX && snakeY === eggY) {
    eggSound.play();
    snakeBody.push(
      [eggX, eggY],
      [eggX, eggY],
      [eggX, eggY],
      [eggX, eggY],
      [eggX, eggY]
    );
    score += 5;
    scoreLayout.textContent = `> score ${score}`;
    eggX = undefined;
    eggY = undefined;
  }

  // Broken neck solution
  for (let i = snakeBody.length - 1; i > 0; i--) {
    snakeBody[i] = snakeBody[i - 1];
  }

  if (snakeBody.length) {
    snakeBody[0] = [snakeX, snakeY];
  }

  snakeX += velocityX * square;
  snakeY += velocityY * square;

  // Game over conditions
  if (
    snakeX < 0 ||
    snakeX >= cols * square ||
    snakeY < 0 ||
    snakeY >= rows * square
  ) {
    gameOver = true;
    crashSound.play();
  }
  for (let i = 0; i < snakeBody.length; i++) {
    if (snakeX === snakeBody[i][0] && snakeY === snakeBody[i][1]) {
      gameOver = true;
      crashSound.play();
    }
  }

  // Snake
  !gameOver ? (ctx.fillStyle = "lightgreen") : (ctx.fillStyle = "lightcoral");
  ctx.fillRect(snakeX + 3, snakeY + 3, square - 6, square - 6);

  for (let i = 0; i < snakeBody.length; i++) {
    ctx.fillRect(
      snakeBody[i][0] + 3,
      snakeBody[i][1] + 3,
      square - 6,
      square - 6
    );
  }

  directionChanged = false;
};

// Random food
const placeFood = () => {
  foodX = Math.floor(Math.random() * cols) * square;
  foodY = Math.floor(Math.random() * rows) * square;
};

// Food style
function drawFood() {
  const size = square - 16;
  const x = foodX + 8;
  const y = foodY + 8;
  const thickness = 12;

  ctx.fillRect(x, y + (size - thickness) / 2, size, thickness);
  ctx.fillRect(x + (size - thickness) / 2, y, thickness, size);
}

// Set egg
const placeEgg = () => {
  const lastTail =
    snakeBody.length - 2
      ? snakeBody[snakeBody.length - 2]
      : snakeBody[snakeBody.length - 1];
  eggX = lastTail[0];
  eggY = lastTail[1];
  setTimeout(() => {
    eggX = undefined;
    eggY = undefined;
  }, 2500);
};

// Egg style
function drawEgg() {
  const size = square - 16;
  const x = eggX + 8;
  const y = eggY + 8;
  const thickness = 12;

  ctx.fillRect(x, y + (size - thickness) / 2, size, thickness + 6);
  ctx.fillRect(x + (size - thickness) / 2, y, thickness, size);
}

// arrow.svg
const svgKeyW = document.querySelector(".key-w");
const svgKeyS = document.querySelector(".key-s");
const svgKeyD = document.querySelector(".key-d");
const svgKeyA = document.querySelector(".key-a");

// Controls
let directionChanged = false;
const changeDirection = (e) => {
  if (!directionChanged)
    if ((e.code === "ArrowUp" || e.code === "KeyW") && velocityY != 1) {
      velocityX = 0;
      velocityY = -1;
      directionChanged = true;
      isKeyPressed = true;
      svgKeyW.classList.add("pressStyle");
    } else if (
      (e.code === "ArrowDown" || e.code === "KeyS") &&
      velocityY != -1
    ) {
      velocityX = 0;
      velocityY = 1;
      directionChanged = true;
      isKeyPressed = true;
      svgKeyS.classList.add("pressStyle");
    } else if (
      (e.code === "ArrowRight" || e.code === "KeyD") &&
      velocityX != -1
    ) {
      velocityX = 1;
      velocityY = 0;
      directionChanged = true;
      isKeyPressed = true;
      svgKeyD.classList.add("pressStyle");
    } else if (
      (e.code === "ArrowLeft" || e.code === "KeyA") &&
      velocityX != 1
    ) {
      velocityX = -1;
      velocityY = 0;
      directionChanged = true;
      isKeyPressed = true;
      svgKeyA.classList.add("pressStyle");
    }
};

const changeKeyColor = (e) => {
  if (e.code === "ArrowUp" || e.code === "KeyW") {
    isKeyPressed = false;
    svgKeyW.classList.remove("pressStyle");
  } else if (e.code === "ArrowDown" || e.code === "KeyS") {
    isKeyPressed = false;
    svgKeyS.classList.remove("pressStyle");
  } else if (e.code === "ArrowRight" || e.code === "KeyD") {
    isKeyPressed = false;
    svgKeyD.classList.remove("pressStyle");
  } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
    isKeyPressed = false;
    svgKeyA.classList.remove("pressStyle");
  }
};

const rootEl = document.documentElement;
rootEl.style.setProperty("--canvas-width", `${board.width}px`);
rootEl.style.setProperty("--canvas-height", `${board.height}px`);

// LocalStorage - HighScore
const saveHighScore = (score) => {
  let highScore = localStorage.getItem("highScore");
  highScore = highScore ? parseInt(highScore) : 0;

  if (score > highScore) {
    localStorage.setItem("highScore", score);
  }
};

const displayHighScore = () => {
  const highScore = localStorage.getItem("highScore");
  if (highScore) {
    document.getElementById(
      "high-score"
    ).textContent = `max score ${highScore}`;
  } else {
    document.getElementById("high-score").textContent = "high score 0";
  }
};

// SpeedUpdater
let currentSpeed = 100;
const adjustSpeed = (score) => {
  if (score % 5 === 0) placeEgg();
  let newSpeed = 100;
  if (score >= 50) newSpeed = 50;
  else if (score >= 40) newSpeed = 60;
  else if (score >= 30) newSpeed = 70;
  else if (score >= 20) newSpeed = 80;
  else if (score >= 10) newSpeed = 90;

  if (currentSpeed != newSpeed) {
    currentSpeed = newSpeed;
    clearInterval(gameLoop);
    gameLoop = setInterval(update, currentSpeed);
  }
};

// Play again
const resetGame = () => {
  snakeX = square * 2;
  snakeY = square * 2;
  velocityX = 0;
  velocityY = 0;
  snakeBody.length = 0;
  score = 0;
  scoreLayout.textContent = `> score ${score}`;
  gameOver = false;
  placeFood();
  displayHighScore();
  directionChanged = false;
  bgMusic.currentTime = 0;
  bgMusic.play();
  clearInterval(gameLoop);
  gameLoop = setInterval(update, 100);
  document.addEventListener("keydown", changeDirection);
  document.addEventListener("keyup", changeKeyColor);
  canvasCont.style.cursor = "none";
};
