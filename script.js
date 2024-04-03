"use strict";

// Variables
const canvas = document.getElementById("canvas");
const canvasMask = document.getElementById("canvas-mask");
const ctx = canvas.getContext("2d");
const ctxMask = canvasMask.getContext("2d");
const colorInput = document.getElementById("color-input");
const sizeInput = document.getElementById("size-input");
let color = "black";
let size = 20;
let drawing = false;
const changesArray = [];
let changesPosition = -1;
const changesArrayLimit = 15;
const mousePos = {
  x: null,
  y: null,
  xDown: null,
  yDown: null,
  xUp: null,
  yUp: null
}
const TOOLS = {
  BRUSH: "brush",
  HIGHLIGHTER: "highlighter",
  ERASER: "eraser",
  SQUARE: "square",
  CIRCLE: "circle",
  MAGIC: "magic"
}
let tool = TOOLS.BRUSH;

// Event Listeners

// Normal canvas
// Mobile
canvas.addEventListener("touchstart", drawStart);
canvas.addEventListener("touchmove", draw);
canvas.addEventListener("touchend", drawEnd);
// Desktop
canvas.addEventListener("mousedown", drawStart);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", drawEnd);
canvas.addEventListener("mouseout", drawEnd);
// Canvas mask
// Mobile
canvasMask.addEventListener("touchstart", drawStart);
canvasMask.addEventListener("touchmove", draw);
canvasMask.addEventListener("touchend", drawEnd);
// Desktop
canvasMask.addEventListener("mousedown", drawStart);
canvasMask.addEventListener("mousemove", draw);
canvasMask.addEventListener("mouseup", drawEnd);
canvasMask.addEventListener("mouseout", drawEnd);

// Functions
function drawStart(e) {
  drawing = true;
  color = colorInput.value;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctxMask.strokeStyle = color;
  size = sizeInput.value;
  switch (tool) {
    case TOOLS.BRUSH:
      ctx.lineWidth = size;
      ctx.beginPath();
      ctx.moveTo(e.x - canvas.offsetLeft, e.y - canvas.offsetTop);
      break;
  }
  mousePos.xDown = e.x - canvas.offsetLeft;
  mousePos.yDown = e.y - canvas.offsetTop;
  draw(e);
}

function draw(e) {
  ctxMask.clearRect(0, 0, canvasMask.width, canvasMask.height); // Clears the mask
  mousePos.x = e.x - canvas.offsetLeft;
  mousePos.y = e.y - canvas.offsetTop;
  if (drawing) {
    switch (tool) {
      case TOOLS.BRUSH:
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
        break;
      case TOOLS.SQUARE:
        const w = mousePos.x - mousePos.xDown;
        const h = mousePos.y - mousePos.yDown;
        ctxMask.strokeRect(mousePos.xDown, mousePos.yDown, w, h);
        break;
    }
  }
}

function drawEnd(e) {
  drawing = false;
  ctx.closePath();
  if (e.type != "mouseout") {
    switch (tool) {
      case TOOLS.BRUSH: ctx.closePath();
        break;
      case TOOLS.SQUARE: ctx.fillRect(mousePos.xDown, mousePos.yDown, mousePos.x - mousePos.xDown, mousePos.y - mousePos.yDown);
        break;
    }
    mousePos.xUp = e.x - canvas.offsetLeft;
    mousePos.yUp = e.y - canvas.offsetTop;
    if (changesPosition != changesArray.length - 1) {
      changesArray.splice(changesPosition + 1);
    }
    changesArray.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (changesArray.length >= changesArrayLimit) {
      changesArray.splice(0, 1);
    } else changesPosition++;
  }
}

function undo() {
  changesPosition--;
  if (changesPosition < 0) {
    clearCanvas();
    changesPosition = -1;
  } else ctx.putImageData(changesArray[changesPosition], 0, 0);
}

function redo() {
  changesPosition++;
  if (changesPosition < changesArray.length) ctx.putImageData(changesArray[changesPosition], 0, 0);
  else changesPosition = changesArray.length - 1;
}

function clearCanvas() {
  ctx.fillStyle = "white";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Tools

function changeTool(newTool) {
  tool = newTool;
  if (newTool == TOOLS.SQUARE || newTool == TOOLS.CIRCLE) {
    canvasMask.style.display = "block";
  } else canvasMask.style.display = "none";
}

// Resize Fix
function resizeFix() {
  const canvasRect = canvas.getBoundingClientRect();
  canvas.width = canvasRect.width;
  canvas.height = canvasRect.height;
  canvasMask.width = canvasRect.width;
  canvasMask.height = canvasRect.height;
  canvasMask.style.width = canvasRect.width + "px";
  canvasMask.style.height = canvasRect.height + "px";
}
window.addEventListener("resize", resizeFix);
resizeFix();