function detectBulletCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function detectTopBottomCollision(a, b) {
  if (a.x > b.x + b.width || a.x + a.width < b.x) return false;

  if (a.y + a.height < b.y || a.y + a.height > b.y + b.height) return false;

  return true;
}

function drawStartScreen() {
  console.log("inside start screen");
  ctx.drawImage(startBgImg, 0, 0, canvasWidth, canvasHeight);

  ctx.drawImage(startBgGif, 40, 360, 91, 100);
  // ctx.fillStyle = "black";
  // ctx.font = "24px Arial";
  // ctx.fillText("Game Start", canvasWidth / 2 - 60, canvasHeight / 2);

  const playBtn = document.querySelector(".play-btn");
}

function drawEndScreen() {
  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText("Game Over", canvasWidth / 2 - 60, canvasHeight / 2);
  ctx.font = "10px Arial";
  ctx.fillText(
    "Game Over: Press 'Space' to restart",
    canvasWidth / 7,
    (canvasHeight * 7) / 8
  );
}
