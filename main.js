// ==== 画面サイズに合わせて設定 ====
const vw = Math.min(window.innerWidth, 1000); // 最大幅640px
const canvas = document.getElementById("game");
canvas.width = vw;
canvas.height = Math.floor(vw * 0.8); // 高さも広め
const ctx = canvas.getContext("2d");

// ==== ゲーム設定 ====
const message = "ぼくのなまえはやすこうちといいます。よろしくおねがいします";
const blockRowCount = 4; // 行数
const blockColumnCount = 7; // 列数
const blockWidth = canvas.width / blockColumnCount - 8; // ブロックの幅
const blockHeight = canvas.height / 13; // ブロックの高さ
const blockPadding = 6;
const blockOffsetTop = 24;
const blockOffsetLeft = 10;

// ===== ブロックデータ作成 =====
let blocks = [];
let index = 0;
for(let r=0; r<blockRowCount; r++) {
  blocks[r] = [];
  for(let c=0; c<blockColumnCount; c++) {
    blocks[r][c] = { x: 0, y: 0, status: 1, charIndex: index++ };
  }
}

// ===== メッセージの表示管理 =====
let revealed = Array(message.length).fill("＿");

// ===== パドル初期化 =====
const paddleHeight = 10;
const paddleWidth = canvas.width / 4;
let paddleX = (canvas.width - paddleWidth) / 2;

// ===== ボール初期化 =====
const ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 40;
let dx = canvas.width / 90;
let dy = -canvas.height / 90;

// ===== 操作状態 =====
let rightPressed = false;
let leftPressed = false;

// ===== タッチ操作用 =====
const touchLeft = document.getElementById("touch-left");
const touchRight = document.getElementById("touch-right");

// ==== タッチイベント
touchLeft.addEventListener("touchstart", e => {
  e.preventDefault();
  leftPressed = true;
});
touchLeft.addEventListener("touchend", e => {
  e.preventDefault();
  leftPressed = false;
});
touchRight.addEventListener("touchstart", e => {
  e.preventDefault();
  rightPressed = true;
});
touchRight.addEventListener("touchend", e => {
  e.preventDefault();
  rightPressed = false;
});

// ===== PCキーボード操作も残す =====
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
function keyDownHandler(e) {
  if(e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  else if(e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}
function keyUpHandler(e) {
  if(e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  else if(e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

// ====== ゲームリセット処理 ======
function resetGame() {
  // ボールの位置と速度リセット
  x = canvas.width / 2;
  y = canvas.height - 40;
  dx = canvas.width / 90;
  dy = -canvas.height / 90;
  // パドルも中央に
  paddleX = (canvas.width - paddleWidth) / 2;
  // ブロックと文字表示のリセット
  let idx = 0;
  for(let r=0; r<blockRowCount; r++) {
    for(let c=0; c<blockColumnCount; c++) {
      blocks[r][c].status = 1;
      blocks[r][c].charIndex = idx++;
    }
  }
  revealed = Array(message.length).fill("＿");
  document.getElementById("message-area").textContent = revealed.join("");
  gameOver = false;
  document.getElementById("restart-btn").style.display = "none";
}

// ====== 衝突判定 ======
function collisionDetection() {
  for(let r=0; r<blockRowCount; r++) {
    for(let c=0; c<blockColumnCount; c++) {
      let b = blocks[r][c];
      if(b.status === 1) {
        if(
          x > b.x && x < b.x + blockWidth &&
          y > b.y && y < b.y + blockHeight
        ) {
          dy = -dy;
          b.status = 0;
          if (b.charIndex < message.length) {
            revealed[b.charIndex] = message[b.charIndex];
          }
          document.getElementById("message-area").textContent = revealed.join("");
          if(isAllCleared()) {
            setTimeout(() => {
              alert("完成！:" + message);
              gameOver = true;
              document.getElementById("restart-btn").style.display = "block";
            }, 100);
          }
        }
      }
    }
  }
}
function isAllCleared() {
  for(let r=0; r<blockRowCount; r++) {
    for(let c=0; c<blockColumnCount; c++) {
      if(blocks[r][c].status === 1) return false;
    }
  }
  return true;
}
function drawBlocks() {
  for(let r=0; r<blockRowCount; r++) {
    for(let c=0; c<blockColumnCount; c++) {
      if(blocks[r][c].status === 1 && blocks[r][c].charIndex < message.length) {
        let blockX = (c * (blockWidth + blockPadding)) + blockOffsetLeft;
        let blockY = (r * (blockHeight + blockPadding)) + blockOffsetTop;
        blocks[r][c].x = blockX;
        blocks[r][c].y = blockY;
        ctx.beginPath();
        ctx.rect(blockX, blockY, blockWidth, blockHeight);
        ctx.fillStyle = "#39f";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI*2);
  ctx.fillStyle = "#fa0";
  ctx.fill();
  ctx.closePath();
}
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height-paddleHeight-5, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0fa";
  ctx.fill();
  ctx.closePath();
}

// ======= ゲームオーバーフラグ ======
let gameOver = false;

// ===== メインループ =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBlocks();
  drawBall();
  drawPaddle();

  if(!gameOver) {
    collisionDetection();
    // 壁・パドルとの判定
    if(x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
    if(y + dy < ballRadius) dy = -dy;
    else if(y + dy > canvas.height - ballRadius - paddleHeight - 5) {
      if(x > paddleX && x < paddleX + paddleWidth) {
        dy = -dy;
      } else if (y + dy > canvas.height - ballRadius) {
        // ====== ゲームオーバー処理 ======
        gameOver = true;
        document.getElementById("restart-btn").style.display = "block";
        return; // drawループを止める（完全停止）
      }
    }
    x += dx;
    y += dy;
    // パドルの移動
    if(rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 10;
    else if(leftPressed && paddleX > 0) paddleX -= 10;

    requestAnimationFrame(draw);
  }
}

// ===== リスタートボタン処理 =====
document.getElementById("restart-btn").addEventListener("click", function() {
  resetGame();
  draw(); // 再開
});

// ===== メッセージ初期表示 & ゲーム開始 =====
document.getElementById("message-area").textContent = revealed.join("");
draw();
