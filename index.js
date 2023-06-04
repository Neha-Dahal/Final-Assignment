//canvas
let canvas;
let canvasWidth = 360;
let canvasHeight = 576;
let ctx;

//doodler
let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = canvasWidth / 2 - doodlerWidth / 2;
let doodlerY = (canvasHeight * 7) / 8 - doodlerHeight;

let doodlerRightImg;
let doodlerLeftImg;
let doodlerUpImg;
let isShooting = false;

//physics
let velocityX = 0;
let velocityY = 0; //doodler jump speed
let initialVelocityY = -3.2; //starting velocity Y
let gravity = 0.1;

//platforms
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;
let platformsOnScreen = 10;
let movingPlatformImg;
let obstaclePlatformImg;
let velX = 0;

//score
let maxScore = 0;
let score = 0;

//bullet
let bulletSpeed = 5;
let bulletSize = 10;
let bullets = [];
let bulletCreated = false;

//gameover
let gameOver = false;

//sounds
let jumpSound;
let gunshotSound;
let shootOnMonsterSound;
let monsterCrashSound;
let fallSound;

let doodler = {
  img: null,
  x: doodlerX,
  y: doodlerY,
  width: doodlerWidth,
  height: doodlerHeight,
};

let platform = {
  img: platformImg,
  x: canvasWidth / 2,
  y: canvasHeight - 50,
  width: platformWidth,
  height: platformHeight,
  passed: false,
  touched: false,
  type: "default",
  velX: velX,
};

window.onload = function () {
  canvas = document.getElementById("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  ctx = canvas.getContext("2d");

  //loading the images

  doodlerRightImg = new Image();
  doodlerRightImg.src = "./images/doodler-right.png";
  doodler.img = doodlerRightImg;
  doodlerRightImg.onload = function () {
    ctx.drawImage(
      doodler.img,
      doodler.x,
      doodler.y,
      doodler.width,
      doodler.height
    );
  };
  doodlerLeftImg = new Image();
  doodlerLeftImg.src = "./images/doodler-left.png";

  doodlerUpImg = new Image();
  doodlerUpImg.src = "./images/doodler-up.png";

  platformImg = new Image();
  platformImg.src = "./images/platform.png";

  obstaclePlatformImg = new Image();
  obstaclePlatformImg.src = "./images/obstaclePlatform.png";

  movingPlatformImg = new Image();
  movingPlatformImg.src = "./images/movingPlatform.png";

  jumpSound = new Audio();
  jumpSound.src = "./audio/jump.wav";

  fallSound = new Audio();
  fallSound.src = "./audio/fall.mp3";

  gunshotSound = new Audio();
  gunshotSound.src = "./audio/gunshot.wav";

  shootOnMonsterSound = new Audio();
  shootOnMonsterSound.src = "./audio/shootonmonster.mp3";

  monsterCrashSound = new Audio();
  monsterCrashSound.src = "./audio/monster-crash.mp3";

  velocityY = initialVelocityY;
  placePlatforms();
  requestAnimationFrame(update);
  document.addEventListener("keydown", moveDoodler);
};

function update() {
  requestAnimationFrame(update);
  if (gameOver) {
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // drawScore();
  //platform
  for (let i = 0; i < platformArray.length; i++) {
    let platform = platformArray[i];

    if (velocityY < 0 && doodler.y < (canvasHeight * 6) / 7) {
      platform.y -= initialVelocityY;
    }
    if (detectCollision(doodler, platform)) {
      if (platform.type == "obstacle") {
        // console.log("collided with obs platform");
        gameOver = true;
        monsterCrashSound.play();
      }
    }
    if (platform.type == "moving") {
      platform.x += platform.velX; // Update platform position based on velocity
      // Reverse the direction if the platform reaches the canvas boundaries
      if (platform.x <= 0 || platform.x + platform.width >= canvasWidth) {
        platform.velX *= -1;
      }
    }

    if (detectCollision(doodler, platform) && velocityY > 0) {
      velocityY = initialVelocityY;
      jumpSound.play();
      // console.log("normal collision");
      // score += 10;
    }
    ctx.drawImage(
      platform.img,
      platform.x,
      platform.y,
      platform.width,
      platform.height
    );
  }
  // clear platforms and add new ones
  while (platformArray.length > 0 && platformArray[0].y >= canvasHeight) {
    platformArray.shift();
    newPlatform();
  }
  updateBullets();

  //doodler

  doodler.x += velocityX;

  if (doodler.x > canvasWidth) {
    doodler.x = 0;
  } else if (doodler.x + doodler.width < 0) {
    doodler.x = canvasWidth;
  }
  velocityY += gravity;
  doodler.y += velocityY;

  if (doodler.y <= canvas.height / 2) {
    doodler.y = canvas.height / 2; // Adjusting the doodler's position to the center of the frame
    // Adjust the canvas accordingly

    for (let i = 0; i < platformArray.length; i++) {
      platformArray[i].y -= velocityY; // Shifting all platforms up
    }
  }
  if (doodler.y > canvas.height) {
    gameOver = true;
    fallSound.play();
  }

  ctx.drawImage(
    doodler.img,
    doodler.x,
    doodler.y,
    doodler.width,
    doodler.height
  );
  drawScore();
  if (score % 200 == 0) {
    let i = 0.001;
    initialVelocityY -= i;
    // console.log(initialVelocityY);
    // gravity += i * 0.75;
    // console.log(gravity);
  }
  if (gameOver) {
    ctx.fillText(
      "Game Over: Press 'Space' to restart",
      canvasWidth / 7,
      (canvasHeight * 7) / 8
    );
    ctx.font = "10px Arial";
  }
}

function moveDoodler(e) {
  if (e.code == "ArrowRight" || e.code == "KeyD") {
    //move right
    velocityX = 2;
    doodler.img = doodlerRightImg;
  } else if (e.code == "ArrowLeft" || e.code == "KeyA") {
    //move left
    velocityX = -2;
    doodler.img = doodlerLeftImg;
  } else if ((e.code == "Space" || e.code == "Spacebar") && !gameOver) {
    doodler.img = doodlerUpImg;
    isShooting = true;
    createBullet();
    // gunshotSound.play();
    console.log(isShooting);
    setTimeout(() => {
      doodler.img = doodlerRightImg;
      // isShooting = false;
    }, 300);
  } else if ((e.code == "Space" || e.code == "Spacebar") && gameOver) {
    //reset the game
    doodler = {
      img: doodlerRightImg,
      x: doodlerX,
      y: doodlerY,
      width: doodlerWidth,
      height: doodlerHeight,
    };
    velocityX = 0;
    initialVelocityY = -3.2;
    velocityY = initialVelocityY;
    gravity = 0.1;
    score = 0;
    maxScore = 0;
    gameOver = false;
    bullets = [];
    placePlatforms();
  }
}
function createBullet() {
  // console.log("bullet created");
  const bullet = {
    x: doodler.x + doodler.width / 2 - bulletSize / 2,
    y: doodler.y,
  };
  bullets.push(bullet);
  bulletCreated = true;
}

function updateBullets() {
  for (let i = 0; i < bullets.length; i++) {
    const bullet = bullets[i];
    bullet.y -= bulletSpeed;

    ctx.fillStyle = "orange";
    console.log("bullet created");
    ctx.fillRect(bullet.x, bullet.y, bulletSize, bulletSize);
    gunshotSound.play();

    // Check collision with obstacle platforms
    for (let j = 0; j < platformArray.length; j++) {
      const platform = platformArray[j];
      if (
        platform.type === "obstacle" &&
        bulletCreated &&
        isShooting &&
        detectBulletCollision(bullet, platform)
      ) {
        platform.img = platformImg;
        platform.type = "default";
        platform.height = platformHeight;
        platform.width = platformWidth;
        platform.y = platform.y + platformHeight / 2;

        console.log("sliced about");
        monsterCrashSound.play();
        bullets.splice(i, 1);
        break;
      }
    }

    // Remove bullets that go off-screen
    if (bullet.y < 0) {
      bullets.splice(i, 1);
      break;
    }
  }
}

function createPlatform(velX, platformHeight, img, x, y, type) {
  let platform = {
    img: img,
    x: x,
    y: y,
    width: platformWidth,
    height: platformHeight,
    passed: false,
    touched: false,
    type: type,
    velX: velX,
  };
  let overlapping = false;
  for (let j = 0; j < platformArray.length; j++) {
    let existingPlatform = platformArray[j];
    if (
      Math.abs(platform.x - existingPlatform.x) < platformWidth &&
      Math.abs(platform.y - existingPlatform.y) < platformHeight
    ) {
      overlapping = true;
      break;
    }
  }
  if (!overlapping) {
    platformArray.push(platform);
  }
}
// platformArray.push(platform);

function createMovingPlatform() {
  let randomX = Math.floor((Math.random() * canvasWidth * 3) / 4);
  let randomY = 0;
  let velX = 2;
  // let img = movingPlatformImg;
  createPlatform(
    velX,
    platformHeight,
    movingPlatformImg,
    randomX,
    randomY,
    "moving"
  );
}

function createObstaclePlatform() {
  let randomX = Math.random() * canvasWidth;
  let randomY = 0;
  let platformHeight = 45;
  console.log("inside create obs platform");
  velX = 0;
  // let image = obstaclePlatformImg;
  createPlatform(
    velX,
    platformHeight,
    obstaclePlatformImg,
    randomX,
    randomY,
    "obstacle"
  );
}
function placePlatforms() {
  platformArray = [];

  createPlatform(
    velX,
    platformHeight,
    platformImg,
    canvasWidth / 2,
    canvasHeight - 50,
    "default"
  );
  for (let i = 0; i < platformsOnScreen - 1; i++) {
    let randomX = Math.floor((Math.random() * canvasWidth * 3) / 4);
    let randomY = canvasHeight - 75 * i - 150;

    createPlatform(
      velX,
      platformHeight,
      platformImg,
      randomX,
      randomY,
      "default"
    );
  }
}
function newPlatform() {
  let randomX = Math.floor((Math.random() * canvasWidth * 3) / 4);
  let randomY = -platformHeight;

  let randomType = Math.random();

  if (score >= 300 && score % 150 == 0 && randomType < 0.5) {
    createMovingPlatform();
  } else if (score >= 250 && score % 250 == 0 && randomType < 0.6) {
    createObstaclePlatform();
  } else {
    createPlatform(
      velX,
      platformHeight,
      platformImg,
      randomX,
      randomY,
      "default"
    );
  }
}
function detectCollision(a, b) {
  if (a.x > b.x + b.width || a.x + a.width < b.x) return false;
  if (a.y + a.height < b.y || a.y + a.height > b.y + b.height) return false;
  return true;
}

function detectBulletCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + bulletSize > b.x &&
    a.y < b.y + b.height &&
    a.y + bulletSize > b.y
  );
}

function drawScore() {
  let points = 10;

  for (let i = 0; i < platformArray.length; i++) {
    let platform = platformArray[i];

    if (detectCollision(doodler, platform)) {
      // Check if the doodler is jumping on a new platform
      if (velocityY < 0 && !platform.touched) {
        score += points;
        platform.touched = true; // Mark the platform as touched
      }
      // Exit the loop if the doodler is on a platform to avoid incrementing score multiple times
      break;
    } else if (doodler.y + doodler.height < platform.y && !platform.passed) {
      score += points;
      platform.passed = true;
    }
  }

  ctx.fillStyle = "black";
  ctx.font = "16px Arial";
  ctx.fillText("Score: " + score, 10, 30);
}
