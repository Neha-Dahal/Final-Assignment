//canvas
let canvasWidth = 360;
let canvasHeight = 576;

//doodler
let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = canvasWidth / 2 - doodlerWidth / 2;
let doodlerY = (canvasHeight * 7) / 8 - doodlerHeight;

//physics
let velocityX = 0;
let velocityY = 0; //doodler jump speed
let initialVelocityY = -3; //starting velocity Y
let gravity = 0.1;
let gap = 50;
