function detectRectangleCollision(a, b) {
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
  ctx.drawImage(startBgImg, 0, 0, canvasWidth, canvasHeight);
}

function drawEndScreen() {
  ctx.drawImage(endBgImg, 0, 0, canvasWidth, canvasHeight);

  ctx.font = "bold 18pt DoodleJump";
  ctx.fillText(`your score : ${score}`, 100, 190);
  ctx.fillText(`your high score : ${highScore}`, 100, 230);
}
