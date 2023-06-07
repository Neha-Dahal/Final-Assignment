function createAndDrawPlatform(platformVelX, platformHeight, img, x, y, type) {
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
  const randomY = -platformHeight;
  const platformVelX = 2;
  createAndDrawPlatform(
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
  const randomY = -platformHeight;
  const obstaclePlatformHeight = 45;
  platformVelX = 0;
  // let image = obstaclePlatformImg;
  createAndDrawPlatform(
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

  createAndDrawPlatform(
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

    createAndDrawPlatform(
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

  if (score >= 100 && score % 100 == 0 && randomType < 0.6) {
    return createMovingPlatform();
  }

  if (score >= 80 && score % 80 == 0 && randomType < 0.7) {
    return createObstaclePlatform();
  }

  return createAndDrawPlatform(
    platformVelX,
    platformHeight,
    platformImg,
    randomX,
    randomY,
    "default"
  );
}
