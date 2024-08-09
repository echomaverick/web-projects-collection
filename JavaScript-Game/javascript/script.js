const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 20;
const INITIAL_PLAYER_HEALTH = 100;
const LEVEL_SCORE_INCREMENT = 200;
const LEVEL_SCORE_START = 300;
const LEVELS = 10;
const STORAGE_KEY = "asteroidsGameHighestScore";

let canvas, ctx;
let playerX, playerY, playerHealth;
let bullets = [];
let asteroids = [];
let score = 0;
let currentLevel = 1;
let gamePaused = false;
let highestScore = localStorage.getItem(STORAGE_KEY) || 0;

function init() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");

  playerX = CANVAS_WIDTH / 2;
  playerY = CANVAS_HEIGHT - 50;
  playerHealth = INITIAL_PLAYER_HEALTH;

  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);

  gameLoop();
}

let leftPressed = false;
let rightPressed = false;
let spacePressed = false;

function keyDownHandler(event) {
  if (event.key === "ArrowLeft" || event.key === "a") {
    leftPressed = true;
  } else if (event.key === "ArrowRight" || event.key === "d") {
    rightPressed = true;
  } else if (event.key === " " || event.key === "Spacebar") {
    spacePressed = true;
  }
}

function keyUpHandler(event) {
  if (event.key === "ArrowLeft" || event.key === "a") {
    leftPressed = false;
  } else if (event.key === "ArrowRight" || event.key === "d") {
    rightPressed = false;
  } else if (event.key === " " || event.key === "Spacebar") {
    spacePressed = false;
  }
}

function gameLoop() {
  if (!gamePaused) {
    update();
    draw();
  }

  requestAnimationFrame(gameLoop);
}

function update() {
  if (leftPressed && playerX > 0) {
    playerX -= 5;
  }
  if (rightPressed && playerX < CANVAS_WIDTH - PLAYER_SIZE) {
    playerX += 5;
  }

  if (spacePressed) {
    bullets.push({ x: playerX + PLAYER_SIZE / 2, y: playerY });
  }
  bullets.forEach((bullet) => {
    bullet.y -= 8;
  });

  if (Math.random() < 0.02 + currentLevel * 0.005) {
    asteroids.push({
      x: Math.random() * CANVAS_WIDTH,
      y: -30,
      size: Math.random() * 20 + 10,
      speed: Math.random() * (2 + currentLevel * 0.5) + 1,
    });
  }

  asteroids.forEach((asteroid) => {
    asteroid.y += asteroid.speed;

    bullets.forEach((bullet) => {
      if (
        bullet.x > asteroid.x &&
        bullet.x < asteroid.x + asteroid.size &&
        bullet.y > asteroid.y &&
        bullet.y < asteroid.y + asteroid.size
      ) {
        bullets = bullets.filter((b) => b !== bullet);
        asteroids = asteroids.filter((a) => a !== asteroid);
        score += 100;
      }
    });

    if (
      playerX + PLAYER_SIZE > asteroid.x &&
      playerX < asteroid.x + asteroid.size &&
      playerY + PLAYER_SIZE > asteroid.y &&
      playerY < asteroid.y + asteroid.size
    ) {
      if (playerHealth > 0) {
        playerHealth--;
      }

      if (playerHealth <= 0) {
        endGame();
      }
    }
  });

  bullets = bullets.filter((bullet) => bullet.y > 0);
  asteroids = asteroids.filter(
    (asteroid) => asteroid.y < CANVAS_HEIGHT + asteroid.size
  );

  if (
    score >= LEVEL_SCORE_START + (currentLevel - 1) * LEVEL_SCORE_INCREMENT &&
    currentLevel < LEVELS
  ) {
    currentLevel++;
  }
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = "white";
  ctx.fillRect(playerX, playerY, PLAYER_SIZE, PLAYER_SIZE);

  ctx.fillStyle = "yellow";
  bullets.forEach((bullet) => {
    ctx.fillRect(bullet.x, bullet.y, 3, 8);
  });

  ctx.fillStyle = "gray";
  asteroids.forEach((asteroid) => {
    ctx.fillRect(asteroid.x, asteroid.y, asteroid.size, asteroid.size);
  });

  ctx.fillStyle = "red";
  ctx.fillRect(10, 10, playerHealth * 3, 10);
  ctx.strokeStyle = "white";
  ctx.strokeRect(10, 10, INITIAL_PLAYER_HEALTH * 3, 10);

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Score: " + score, 10, 30);
  ctx.fillText("Level: " + currentLevel, 10, 50);

  ctx.fillText("Highest Score: " + highestScore, CANVAS_WIDTH - 150, 30);
}

function endGame() {
  alert("Game Over! Your health reached zero.");
  gamePaused = true;
  if (score > highestScore) {
    highestScore = score;
    localStorage.setItem(STORAGE_KEY, highestScore);
  }

  resetGame();
}

function resetGame() {
  playerHealth = INITIAL_PLAYER_HEALTH;
  bullets = [];
  asteroids = [];
  score = 0;
  currentLevel = 1;
}

window.onload = init;
