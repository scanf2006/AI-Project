/**
 * 星际竞技场 (STELLAR ARENA) - 核心逻辑
 */

// --- 基础配置 ---
const config = {
    arenaSize: 2500,       // 竞技场总大小
    initialEnemies: 9,     // 初始 AI 敌人数量
    playerSpeed: 4,        // 玩家移动速度
    bulletSpeed: 10,       // 子弹速度
    zoneShrinkRate: 0.1,   // 每秒缩圈大小
    zoneDamage: 0.5,       // 在圈外每帧扣血量
};

// --- 初始化变量 ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const overlay = document.getElementById('overlay');
const menuContent = document.getElementById('menu-content');
const endContent = document.getElementById('end-content');

let keys = {};
let mouse = { x: 0, y: 0 };
let gameState = 'MENU'; // MENU, PLAYING, END
let camera = { x: 0, y: 0 };
let player, enemies, bullets, particles, currentZoneRadius;
let kills = 0;

// --- 实体类定义 ---

class Entity {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.health = 100;
        this.isDead = false;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x - camera.x, this.y - camera.y);
        this.render();
        ctx.restore();
    }

    render() {
        // 子类重写
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.isDead = true;
            createExplosion(this.x, this.y, this.color);
        }
    }
}

class Player extends Entity {
    constructor(x, y) {
        super(x, y, 20, '#00f3ff');
        this.angle = 0;
    }

    update() {
        // 移动逻辑
        if (keys['w'] || keys['W']) this.y -= config.playerSpeed;
        if (keys['s'] || keys['S']) this.y += config.playerSpeed;
        if (keys['a'] || keys['A']) this.x -= config.playerSpeed;
        if (keys['d'] || keys['D']) this.x += config.playerSpeed;

        // 边界限制
        this.x = Math.max(0, Math.min(config.arenaSize, this.x));
        this.y = Math.max(0, Math.min(config.arenaSize, this.y));

        // 旋转角度
        const dx = mouse.x - (canvas.width / 2);
        const dy = mouse.y - (canvas.height / 2);
        this.angle = Math.atan2(dy, dx);

        // 检查缩圈伤害
        const distToCenter = Math.hypot(this.x - config.arenaSize / 2, this.y - config.arenaSize / 2);
        if (distToCenter > currentZoneRadius) {
            this.takeDamage(config.zoneDamage);
        }
    }

    render() {
        ctx.rotate(this.angle);

        // 绘制三角形战机
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(-this.radius, -this.radius / 1.5);
        ctx.lineTo(-this.radius, this.radius / 1.5);
        ctx.closePath();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // 发光核心
        ctx.fillStyle = 'rgba(0, 243, 255, 0.3)';
        ctx.fill();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
    }
}

class Enemy extends Entity {
    constructor(x, y) {
        super(x, y, 20, '#ff00ff');
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 2 + Math.random() * 2;
        this.shootTimer = 0;
        this.targetAngle = this.angle;
    }

    update() {
        // 简易智力：朝向中心移动并偶尔转向
        const dxToCenter = config.arenaSize / 2 - this.x;
        const dyToCenter = config.arenaSize / 2 - this.y;
        const distToCenter = Math.hypot(dxToCenter, dyToCenter);

        // 如果在圈外，拼命回圈
        if (distToCenter > currentZoneRadius - 100) {
            this.targetAngle = Math.atan2(dyToCenter, dxToCenter);
            this.takeDamage(config.zoneDamage);
        } else if (Math.random() < 0.01) {
            this.targetAngle += (Math.random() - 0.5);
        }

        // 平滑旋转
        this.angle += (this.targetAngle - this.angle) * 0.1;

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // 边界限制
        this.x = Math.max(0, Math.min(config.arenaSize, this.x));
        this.y = Math.max(0, Math.min(config.arenaSize, this.y));

        // 射击逻辑
        this.shootTimer++;
        const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
        if (this.shootTimer > 60 && distToPlayer < 600) {
            const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
            bullets.push(new Bullet(this.x, this.y, angleToPlayer, this.color, 'ENEMY'));
            this.shootTimer = 0;
        }
    }

    render() {
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(-this.radius, -this.radius);
        ctx.lineTo(-this.radius / 2, 0);
        ctx.lineTo(-this.radius, this.radius);
        ctx.closePath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
    }
}

class Bullet {
    constructor(x, y, angle, color, owner) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * config.bulletSpeed;
        this.vy = Math.sin(angle) * config.bulletSpeed;
        this.color = color;
        this.owner = owner; // 'PLAYER' or 'ENEMY'
        this.distance = 0;
        this.isDead = false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.distance += config.bulletSpeed;
        if (this.distance > 1000) this.isDead = true;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x - camera.x, this.y - camera.y);
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.alpha = 1;
        this.color = color;
        this.life = 0.95;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha *= this.life;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x - camera.x, this.y - camera.y);
        ctx.fillStyle = this.color;
        ctx.fillRect(-2, -2, 4, 4);
        ctx.restore();
    }
}

// --- 游戏功能函数 ---

function createExplosion(x, y, color) {
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function initGame() {
    player = new Player(config.arenaSize / 2, config.arenaSize / 2);
    enemies = [];
    for (let i = 0; i < config.initialEnemies; i++) {
        let x = Math.random() * config.arenaSize;
        let y = Math.random() * config.arenaSize;
        // 避免出生在玩家太近的地方
        while (Math.hypot(x - player.x, y - player.y) < 500) {
            x = Math.random() * config.arenaSize;
            y = Math.random() * config.arenaSize;
        }
        enemies.push(new Enemy(x, y));
    }
    bullets = [];
    particles = [];
    currentZoneRadius = config.arenaSize * 0.7;
    kills = 0;

    updateHUD();
}

function updateHUD() {
    document.getElementById('alive-count').innerText = enemies.length + (player.isDead ? 0 : 1);
    document.getElementById('kill-count').innerText = kills;
    document.getElementById('health-bar').style.width = Math.max(0, player.health) + '%';

    if (player.health < 30) {
        document.getElementById('health-bar').style.background = '#ff0055';
    } else {
        document.getElementById('health-bar').style.background = 'linear-gradient(90deg, var(--primary), #00a2ff)';
    }
}

function checkCollisions() {
    bullets.forEach(bullet => {
        if (bullet.owner === 'ENEMY') {
            const dist = Math.hypot(bullet.x - player.x, bullet.y - player.y);
            if (dist < player.radius) {
                player.takeDamage(10);
                bullet.isDead = true;
            }
        } else {
            enemies.forEach(enemy => {
                const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
                if (dist < enemy.radius) {
                    enemy.takeDamage(25);
                    bullet.isDead = true;
                    if (enemy.isDead) kills++;
                }
            });
        }
    });

    // 敌人之间的碰撞或子弹伤害 (可选，暂不实现以简化逻辑)
}

function drawBackground() {
    // 绘制灰色背景网格
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const step = 50;

    ctx.beginPath();
    for (let x = -camera.x % step; x < canvas.width; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for (let y = -camera.y % step; y < canvas.height; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    // 绘制竞技场边界
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 5;
    ctx.strokeRect(0 - camera.x, 0 - camera.y, config.arenaSize, config.arenaSize);

    // 绘制缩圈安全区边界
    ctx.beginPath();
    ctx.arc(config.arenaSize / 2 - camera.x, config.arenaSize / 2 - camera.y, currentZoneRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.stroke();
    ctx.setLineDash([]);
}

function endGame(won) {
    gameState = 'END';
    overlay.classList.remove('hidden');
    menuContent.classList.add('hidden');
    endContent.classList.remove('hidden');

    document.getElementById('end-title').innerText = won ? '生存大师' : '你被淘汰了';
    document.getElementById('end-title').style.color = won ? 'var(--primary)' : '#ff0055';
    document.getElementById('final-kills').innerText = kills;
    document.getElementById('final-rank').innerText = '#' + (enemies.length + 1);
}

// --- 主循环 ---

function gameLoop() {
    if (gameState !== 'PLAYING') return;

    // 清理画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 更新相机 (跟随玩家)
    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;

    // 缩圈逻辑
    if (currentZoneRadius > 100) {
        currentZoneRadius -= config.zoneShrinkRate;
    }

    // 渲染背景
    drawBackground();

    // 更新和绘制实体
    player.update();
    player.draw();

    enemies.forEach((enemy, index) => {
        enemy.update();
        enemy.draw();
        if (enemy.isDead) enemies.splice(index, 1);
    });

    bullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();
        if (bullet.isDead) bullets.splice(index, 1);
    });

    particles.forEach((p, index) => {
        p.update();
        p.draw();
        if (p.alpha < 0.01) particles.splice(index, 1);
    });

    checkCollisions();
    updateHUD();

    // 检查胜负条件
    if (player.isDead) {
        endGame(false);
    } else if (enemies.length === 0) {
        endGame(true);
    }

    requestAnimationFrame(gameLoop);
}

// --- 事件监听 ---

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);
window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mousedown', () => {
    if (gameState === 'PLAYING') {
        bullets.push(new Bullet(player.x, player.y, player.angle, player.color, 'PLAYER'));
    }
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

startBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    gameState = 'PLAYING';
    initGame();
    gameLoop();
});

restartBtn.addEventListener('click', () => {
    endContent.classList.add('hidden');
    overlay.classList.add('hidden');
    gameState = 'PLAYING';
    initGame();
    gameLoop();
});

// 初始画布大小
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
