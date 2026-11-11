var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

var dino = { x: 80, y: 0, w: 58, h: 58, vy: 0, jumping: false, ducking: false };
var obstacles = [];
var score = 0;
var speed = 5;
var loop = null;
var over = false;
var started = false;
var high = parseInt(localStorage.getItem('dinoHigh') || '0');
var gravity = 0.85;
var frame = 0;

function $(id){ return document.getElementById(id); }
$('highScore').textContent = high;

function resize(){
  var dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  dino.x = Math.min(80, window.innerWidth * 0.12);
  if(!started) dino.y = groundY();
}

function groundY(){
  return window.innerHeight - 120;
}

function groundLine(){
  return window.innerHeight - 68;
}

window.addEventListener('resize', resize);
window.addEventListener('orientationchange', function(){
  setTimeout(resize, 200);
});
resize();
dino.y = groundY();

function spawnObstacle(){
  var types = [
    { emoji: '🌵', w: 34, h: 48, fly: false },
    { emoji: '🪨', w: 42, h: 36, fly: false },
    { emoji: '🦅', w: 48, h: 36, fly: true },
    { emoji: '🔥', w: 40, h: 42, fly: false }
  ];
  var t = types[Math.floor(Math.random() * types.length)];
  var y = t.fly ? groundY() - 55 : groundY();
  var newObs = {
    x: window.innerWidth + 20,
    y: y,
    w: t.w,
    h: t.h,
    emoji: t.emoji
  };
  obstacles.push(newObs);
}

function draw(){
  var W = window.innerWidth;
  var H = window.innerHeight;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#e8d5b5';
  ctx.fillRect(0, groundLine(), W, 68);
  ctx.strokeStyle = '#d4b896';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundLine());
  ctx.lineTo(W, groundLine());
  ctx.stroke();

  var dinoSize = W < 500 ? 46 : 56;
  ctx.font = dinoSize + 'px Arial';
  ctx.fillText('🦖', dino.x, dino.y + 52);
  ctx.font = (W < 500 ? 34 : 42) + 'px Arial';
  for(var i = 0; i < obstacles.length; i++){
    ctx.fillText(obstacles[i].emoji, obstacles[i].x, obstacles[i].y + 42);
  }
}

function update(){
  frame++;
  var spawnRate = window.innerWidth < 500 ? 65 : 80;
  if(frame % spawnRate === 0){
    spawnObstacle();
  }

  if(dino.jumping){
    dino.vy += gravity;
    dino.y += dino.vy;
    if(dino.y >= groundY()){
      dino.y = groundY();
      dino.jumping = false;
      dino.vy = 0;
    }
  }

  for(var i = obstacles.length - 1; i >= 0; i--){
    obstacles[i].x -= speed;
    if(obstacles[i].x < -60){
      obstacles.splice(i, 1);
      continue;
    }
    var o = obstacles[i];
    var dh = dino.ducking ? 35 : dino.h;
    if(o && dino.x < o.x + o.w - 8 &&
       dino.x + dino.w - 8 > o.x &&
       dino.y < o.y + o.h - 8 &&
       dino.y + dh - 8 > o.y){
      return gameOver();
    }
  }

  score++;
  if(score % 500 === 0){
    speed += 1.2;
  }
  $('score').textContent = score;
  if(score > high){
    high = score;
    localStorage.setItem('dinoHigh', high);
    $('highScore').textContent = high;
  }
  draw();
}

function jump(){
  if(!started || over) return;
  if(!dino.jumping){
    dino.jumping = true;
    dino.ducking = false;
    dino.vy = -15;
  }
}

function gameOver(){
  over = true;
  clearInterval(loop);
  $('fScore').textContent = score;
  $('overScreen').classList.remove('hide');
}

function startGame(){
  score = 0;
  speed = window.innerWidth < 500 ? 4.5 : 5;
  frame = 0;
  obstacles = [];
  dino.y = groundY();
  dino.x = Math.min(80, window.innerWidth * 0.12);
  dino.jumping = false;
  dino.ducking = false;
  over = false;
  started = true;
  $('score').textContent = '0';
  $('startScreen').classList.add('hide');
  $('overScreen').classList.add('hide');
  clearInterval(loop);
  loop = setInterval(update, 1000 / 60);
}

document.addEventListener('keydown', function(e){
  if(e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space'){
    e.preventDefault();
    if(!started || over) startGame();
    else jump();
  }
  if(e.code === 'KeyS' || e.code === 'ArrowDown'){
    if(started && !over) dino.ducking = true;
  }
  if(e.code === 'KeyA'){ dino.x = Math.max(20, dino.x - 18); }
  if(e.code === 'KeyD'){ dino.x = Math.min(window.innerWidth * 0.3, dino.x + 18); }
});

document.addEventListener('keyup', function(e){
  if(e.code === 'KeyS' || e.code === 'ArrowDown') dino.ducking = false;
});

canvas.addEventListener('touchstart', function(e){
  e.preventDefault();
  if(!started || over) startGame();
  else jump();
}, { passive: false });

canvas.addEventListener('mousedown', function(){
  if(!started || over) startGame();
  else jump();
});

document.getElementById('startBtn').addEventListener('click', function(e){
  e.stopPropagation();
  startGame();
});
document.getElementById('restartBtn').addEventListener('click', function(e){
  e.preventDefault();
  e.stopPropagation();
  startGame();
});

draw();