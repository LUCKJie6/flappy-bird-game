const game = document.getElementById("game");
const bird = document.getElementById("bird");
const pipesBox = document.getElementById("pipes");
const scoreText = document.getElementById("score");
const overlay = document.getElementById("overlay");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const restartButton = document.getElementById("restartButton");
const easyButton = document.getElementById("easyButton");
const normalButton = document.getElementById("normalButton");
const hardButton = document.getElementById("hardButton");

const GAME_WIDTH = 420;
const GAME_HEIGHT = 640;
const GROUND_HEIGHT = 96;

const BIRD_X = 90;
const BIRD_WIDTH = 42;
const BIRD_HEIGHT = 32;

const PIPE_WIDTH = 68;

const DIFFICULTIES = {
  easy: {
    name: "简单",
    gravity: 0.18,
    jumpForce: -5.2,
    pipeGap: 230,
    pipeSpeed: 1.3,
    pipeInterval: 145
  },
  normal: {
    name: "普通",
    gravity: 0.28,
    jumpForce: -6.6,
    pipeGap: 190,
    pipeSpeed: 1.8,
    pipeInterval: 120
  },
  hard: {
    name: "困难",
    gravity: 0.42,
    jumpForce: -8.2,
    pipeGap: 150,
    pipeSpeed: 2.7,
    pipeInterval: 90
  }
};

let birdY = 240;
let birdSpeed = 0;
let score = 0;
let frameCount = 0;
let pipes = [];
let isPlaying = false;
let isGameOver = false;
let animationId = null;
let currentDifficulty = DIFFICULTIES.easy;

function resetGame() {
  cancelAnimationFrame(animationId);

  birdY = 240;
  birdSpeed = 0;
  score = 0;
  frameCount = 0;
  pipes = [];
  isPlaying = false;
  isGameOver = false;

  pipesBox.innerHTML = "";
  scoreText.textContent = score;
  restartButton.hidden = true;
  messageTitle.textContent = "Flappy Bird";
  messageText.textContent = `当前难度：${currentDifficulty.name}。按空格键或点击画面开始游戏`;
  overlay.classList.remove("hidden");

  updateBirdPosition();
}

function startGame() {
  if (isPlaying) {
    return;
  }

  isPlaying = true;
  overlay.classList.add("hidden");
  animationId = requestAnimationFrame(gameLoop);
}

function flap() {
  if (isGameOver) {
    return;
  }

  if (!isPlaying) {
    startGame();
  }

  // 跳跃：给小鸟一个向上的速度，数值越小飞得越高。
  birdSpeed = currentDifficulty.jumpForce;
}

function updateBirdPosition() {
  bird.style.left = `${BIRD_X}px`;
  bird.style.top = `${birdY}px`;

  const rotate = Math.max(-25, Math.min(65, birdSpeed * 5));
  bird.style.transform = `rotate(${rotate}deg)`;
}

function createPipe() {
  const minTopHeight = 70;
  const maxTopHeight = GAME_HEIGHT - GROUND_HEIGHT - currentDifficulty.pipeGap - 80;
  const topHeight = randomNumber(minTopHeight, maxTopHeight);
  const bottomTop = topHeight + currentDifficulty.pipeGap;
  const bottomHeight = GAME_HEIGHT - GROUND_HEIGHT - bottomTop;

  const upperPipe = document.createElement("div");
  upperPipe.className = "pipe upper";
  upperPipe.style.left = `${GAME_WIDTH}px`;
  upperPipe.style.height = `${topHeight}px`;

  const lowerPipe = document.createElement("div");
  lowerPipe.className = "pipe lower";
  lowerPipe.style.left = `${GAME_WIDTH}px`;
  lowerPipe.style.top = `${bottomTop}px`;
  lowerPipe.style.height = `${bottomHeight}px`;

  pipesBox.append(upperPipe, lowerPipe);

  pipes.push({
    x: GAME_WIDTH,
    topHeight,
    bottomTop,
    passed: false,
    upperPipe,
    lowerPipe
  });
}

function movePipes() {
  pipes.forEach((pipe) => {
    pipe.x -= currentDifficulty.pipeSpeed;
    pipe.upperPipe.style.left = `${pipe.x}px`;
    pipe.lowerPipe.style.left = `${pipe.x}px`;

    // 计分：当小鸟完全飞过一组管道后加 1 分。
    if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X) {
      pipe.passed = true;
      score += 1;
      scoreText.textContent = score;
    }
  });

  // 移除已经离开屏幕的管道，避免页面元素越来越多。
  pipes = pipes.filter((pipe) => {
    const isVisible = pipe.x + PIPE_WIDTH > -20;

    if (!isVisible) {
      pipe.upperPipe.remove();
      pipe.lowerPipe.remove();
    }

    return isVisible;
  });
}

function checkCollision() {
  const birdBox = {
    left: BIRD_X + 4,
    right: BIRD_X + BIRD_WIDTH - 4,
    top: birdY + 4,
    bottom: birdY + BIRD_HEIGHT - 4
  };

  // 碰撞检测：小鸟碰到地面时游戏结束。
  if (birdBox.bottom >= GAME_HEIGHT - GROUND_HEIGHT) {
    endGame();
    return;
  }

  pipes.forEach((pipe) => {
    const hitPipeX = birdBox.right > pipe.x && birdBox.left < pipe.x + PIPE_WIDTH;
    const hitUpperPipe = birdBox.top < pipe.topHeight;
    const hitLowerPipe = birdBox.bottom > pipe.bottomTop;

    // 碰撞检测：横向重叠，并且碰到上管道或下管道，就算失败。
    if (hitPipeX && (hitUpperPipe || hitLowerPipe)) {
      endGame();
    }
  });
}

function gameLoop() {
  if (!isPlaying || isGameOver) {
    return;
  }

  frameCount += 1;

  // 重力：每一帧都让下落速度增加，小鸟会越来越快地下落。
  birdSpeed += currentDifficulty.gravity;
  birdY += birdSpeed;

  if (birdY < 0) {
    birdY = 0;
    birdSpeed = 0;
  }

  updateBirdPosition();

  if (frameCount % currentDifficulty.pipeInterval === 0) {
    createPipe();
  }

  movePipes();
  checkCollision();

  if (!isGameOver) {
    animationId = requestAnimationFrame(gameLoop);
  }
}

function endGame() {
  isGameOver = true;
  isPlaying = false;
  cancelAnimationFrame(animationId);

  messageTitle.textContent = "游戏结束";
  messageText.textContent = `你的得分：${score}。当前难度：${currentDifficulty.name}`;
  restartButton.hidden = false;
  overlay.classList.remove("hidden");
}

function setDifficulty(level) {
  currentDifficulty = DIFFICULTIES[level];
  easyButton.classList.toggle("active", level === "easy");
  normalButton.classList.toggle("active", level === "normal");
  hardButton.classList.toggle("active", level === "hard");

  if (!isPlaying && !isGameOver) {
    messageText.textContent = `当前难度：${currentDifficulty.name}。按空格键或点击画面开始游戏`;
  }

  if (isGameOver) {
    messageText.textContent = `你的得分：${score}。当前难度：${currentDifficulty.name}`;
  }
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    flap();
  }
});

game.addEventListener("click", flap);

easyButton.addEventListener("click", (event) => {
  event.stopPropagation();
  setDifficulty("easy");
});

normalButton.addEventListener("click", (event) => {
  event.stopPropagation();
  setDifficulty("normal");
});

hardButton.addEventListener("click", (event) => {
  event.stopPropagation();
  setDifficulty("hard");
});

restartButton.addEventListener("click", (event) => {
  event.stopPropagation();
  resetGame();
  startGame();
  flap();
});

resetGame();
