let isShooting = false;

let doodlerVelocityX = 0;
let initialVelocityY = -3; // starting velocity Y
let gravity = 0.1;
let gap = 50;

let platformArray = [];
let platformVelX = 0;

let maxScore = 0;
let score = 0;

let bulletSpeed = 5;
let bulletSize = 10;
let bullets = [];
let bulletCreated = false;

let gameState = "start";

let doodler = {
  img: doodlerRightImg,
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
  platformVelX: platformVelX,
};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = canvasWidth;
canvas.height = canvasHeight;

let velocityY = initialVelocityY;

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === "start") {
    return drawStartScreen();
  }

  if (gameState === "playing") {
    return updateGame();
  }

  if (gameState === "end") {
    return drawEndScreen();
  }
}

function updateGame() {
  for (let i = 0; i < platformArray.length; i++) {
    const platform = platformArray[i];

    if (velocityY < 0 && doodler.y < (canvasHeight * 6) / 7) {
      platform.y -= initialVelocityY;
    }

    if (detectTopBottomCollision(doodler, platform)) {
      if (platform.type == "obstacle") {
        gameState = "end";
        monsterCrashSound.play();
      }
    }

    if (platform.type == "moving") {
      platform.x += platform.platformVelX; // Update platform position based on velocity
      // Reverse the direction if the platform reaches the canvas boundaries
      if (platform.x <= 0 || platform.x + platform.width >= canvasWidth) {
        platform.platformVelX *= -1;
      }
    }

    if (detectTopBottomCollision(doodler, platform) && velocityY > 0) {
      velocityY = initialVelocityY;
      jumpSound.play();
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
    createNewPlatform();
  }

  if (score >= 500) {
    gap = 75;
    platformsOnScreen = 8;
  }

  updateBullets();

  doodler.x += doodlerVelocityX;

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
    gameState = "end";
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

  score % 200 == 0 ? (initialVelocityY -= 0.001) : null;
}

function moveDoodler(e) {
  if (gameState == "start") {
    if (e.code === "Space" || e.code === "Spacebar") {
      gameState = "playing";
    }
  } else if (gameState == "playing") {
    if (e.code == "ArrowRight" || e.code == "KeyD") {
      //move right
      doodlerVelocityX = 2;
      doodler.img = doodlerRightImg;
    } else if (e.code == "ArrowLeft" || e.code == "KeyA") {
      //move left
      doodlerVelocityX = -2;
      doodler.img = doodlerLeftImg;
    } else if (
      (e.code == "Space" || e.code == "Spacebar") &&
      gameState != "end"
    ) {
      doodler.img = doodlerUpImg;
      isShooting = true;
      createBullet();
      gunshotSound.play();
      setTimeout(() => {
        doodler.img = doodlerRightImg;
      }, 300);
    }
  } else if (
    (e.code == "Space" || e.code == "Spacebar") &&
    gameState == "end"
  ) {
    //reset the game
    doodler = {
      img: doodlerRightImg,
      x: doodlerX,
      y: doodlerY,
      width: doodlerWidth,
      height: doodlerHeight,
    };
    doodlerVelocityX = 0;
    initialVelocityY = -3;
    velocityY = initialVelocityY;
    gravity = 0.1;
    score = 0;
    maxScore = 0;
    bullets = [];
    platformsOnScreen = 14;
    gap = 50;
    placePlatforms();
    gameState = "playing";
  }
}

function createBullet() {
  const bullet = {
    x: doodler.x + doodler.width / 2 - bulletSize / 2,
    y: doodler.y,
    width: bulletSize,
    height: bulletSize,
  };
  bullets.push(bullet);
  bulletCreated = true;
}

function updateBullets() {
  for (let i = 0; i < bullets.length; i++) {
    const bullet = bullets[i];
    bullet.y -= bulletSpeed;

    ctx.fillStyle = "orange";
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    // gunshotSound.play();

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

function createPlatform(platformVelX, platformHeight, img, x, y, type) {
  const platform = {
    img,
    x,
    y,
    width: platformWidth,
    height: platformHeight,
    passed: false,
    touched: false,
    type,
    platformVelX,
  };

  let overlapping = false;
  for (let j = 0; j < platformArray.length; j++) {
    const existingPlatform = platformArray[j];
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

function createMovingPlatform() {
  const randomX = Math.floor((Math.random() * canvasWidth * 3) / 4);
  const randomY = 0;
  const platformVelX = 2;
  createPlatform(
    platformVelX,
    platformHeight,
    movingPlatformImg,
    randomX,
    randomY,
    "moving"
  );
}

function createObstaclePlatform() {
  const randomX = (Math.random() * canvasWidth * 3) / 4;
  const randomY = 0;
  const obstaclePlatformHeight = 45;
  platformVelX = 0;
  // let image = obstaclePlatformImg;
  createPlatform(
    platformVelX,
    obstaclePlatformHeight,
    obstaclePlatformImg,
    randomX,
    randomY,
    "obstacle"
  );
}

function placePlatforms() {
  platformArray = [];

  createPlatform(
    platformVelX,
    platformHeight,
    platformImg,
    canvasWidth / 2,
    canvasHeight - 50,
    "default"
  );

  for (let i = 0; i < platformsOnScreen - 1; i++) {
    const randomX = Math.floor((Math.random() * canvasWidth * 3) / 4);
    const randomY = canvasHeight - gap * i - 150;

    createPlatform(
      platformVelX,
      platformHeight,
      platformImg,
      randomX,
      randomY,
      "default"
    );
  }
}

function createNewPlatform() {
  const randomX = Math.floor((Math.random() * canvasWidth * 3) / 4);
  const randomY = -platformHeight;
  const randomType = Math.random();

  if (score >= 300 && score % 150 == 0 && randomType < 0.5) {
    return createMovingPlatform();
  }

  if (score >= 250 && score % 250 == 0 && randomType < 0.6) {
    return createObstaclePlatform();
  }

  return createPlatform(
    platformVelX,
    platformHeight,
    platformImg,
    randomX,
    randomY,
    "default"
  );
}

function drawScore() {
  const points = 10;

  for (let i = 0; i < platformArray.length; i++) {
    const platform = platformArray[i];

    if (detectTopBottomCollision(doodler, platform)) {
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
  ctx.fillText(`Score: ${score}`, 10, 30);
}

document.addEventListener("keydown", moveDoodler);
placePlatforms();
animate();
