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
let initialVelocityY = -3; //starting velocity Y
let gravity = 0.1;

//platforms
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;
let platformsOnScreen = 10;

//score
let maxScore = 0;
let score = 0;

//gameover
let gameOver = false;

let doodler = {
  img: null,
  x: doodlerX,
  y: doodlerY,
  width: doodlerWidth,
  height: doodlerHeight,
};

window.onload = function () {
  canvas = document.getElementById("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  ctx = canvas.getContext("2d");

  //draw the doodler
  //   ctx.fillStyle = "green";
  //   ctx.fillRect(doodler.x, doodler.y, doodler.width, doodler.height);

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
  }

  ctx.drawImage(
    doodler.img,
    doodler.x,
    doodler.y,
    doodler.width,
    doodler.height
  );
  drawScore();
  if (gameOver) {
    ctx.fillText(
      "Game Over: Press 'Space' to restart",
      canvasWidth / 7,
      (canvasHeight * 7) / 8
    );
    ctx.font = "10px Arial";
  }

  //platform
  for (let i = 0; i < platformArray.length; i++) {
    let platform = platformArray[i];

    if (velocityY < 0 && doodler.y < (canvasHeight * 6) / 7) {
      platform.y -= initialVelocityY;
    }
    if (detectCollision(doodler, platform) && velocityY >= 0) {
      velocityY = initialVelocityY;
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
  drawScore();
}

function moveDoodler(e) {
  if (e.code == "ArrowRight" || e.code == "KeyD") {
    //move right
    velocityX = 3;
    doodler.img = doodlerRightImg;
  } else if (e.code == "ArrowLeft" || e.code == "KeyA") {
    //move left
    velocityX = -3;
    doodler.img = doodlerLeftImg;
  } else if ((e.code == "Space" || e.code == "Spacebar") && !gameOver) {
    doodler.img = doodlerUpImg;
    isShooting = true;

    setTimeout(() => {
      doodler.img = doodlerRightImg;
      isShooting = false;
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
    velocityY = initialVelocityY;
    score = 0;
    maxScore = 0;
    gameOver = false;
    placePlatforms();
  }
}

function placePlatforms() {
  platformArray = [];

  //starting platforms
  let platform = {
    img: platformImg,
    x: canvasWidth / 2,
    y: canvasHeight - 50,
    width: platformWidth,
    height: platformHeight,
    passed: false,
    touched: false,
  };
  platformArray.push(platform);

  for (let i = 0; i < platformsOnScreen; i++) {
    let randomX = Math.floor((Math.random() * canvasWidth * 3) / 4);
    platform = {
      img: platformImg,
      x: randomX,
      y: canvasHeight - 75 * i - 150,
      width: platformWidth,
      height: platformHeight,
      // passed: false,
      // touched: false,
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
    } else {
      i--; // Retry with a new platform position
    }
  }
}

function newPlatform() {
  let randomX = Math.floor((Math.random() * canvasWidth * 3) / 4);
  let platform = {
    img: platformImg,
    x: randomX,
    y: -platformHeight,
    width: platformWidth,
    height: platformHeight,
    passed: false,
    touched: false,
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
  } else {
    return;
  }
  // platformArray.push(platform);
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
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
