/**
 * 霓虹躲避者 (Neon Dodger)
 * 一个高性能的 Canvas 小游戏
 */

// --- 实用工具函数 ---
const random = (min, max) => Math.random() * (max - min) + min;
const lerp = (a, b, t) => a + (b - a) * t;

// --- 粒子类 ---
class Particle {
    constructor(x, y, color, size, velocity) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.velocity = velocity;
        this.alpha = 1;
        this.friction = 0.98;
        this.decay = random(0.01, 0.03);
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
    }
}

// --- 敌人/死亡方块类 ---
class Enemy {
    constructor(canvasWidth, speed) {
        this.size = random(20, 50);
        this.reset(canvasWidth, speed);
    }

    reset(canvasWidth, speed) {
        this.x = random(0, canvasWidth - this.size);
        this.y = -this.size - random(0, 500);
        this.speed = speed * random(0.8, 1.5);
        this.color = '#ff3c3c';
        this.glowColor = 'rgba(255, 60, 60, 0.5)';
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = random(-0.05, 0.05);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.rotate(this.rotation);

        ctx.shadowBlur = 15;
        ctx.shadowColor = this.glowColor;
        ctx.fillStyle = this.color;

        // 绘制圆角矩形或菱形
        ctx.beginPath();
        ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
    }
}

// --- 玩家类 ---
class Player {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.radius = 12;
        this.color = '#00f2ff';
        this.trail = [];
    }

    draw(ctx) {
        // 绘制拖尾
        ctx.save();
        for (let i = 0; i < this.trail.length; i++) {
            const p = this.trail[i];
            const ratio = i / this.trail.length;
            ctx.globalAlpha = ratio * 0.3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, this.radius * ratio, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        ctx.restore();

        // 绘制主体
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // 核心亮点
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.restore();
    }

    update() {
        // 平滑移动 (插值)
        this.x = lerp(this.x, this.targetX, 0.15);
        this.y = lerp(this.y, this.targetY, 0.15);

        // 更新拖尾
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) this.trail.shift();
    }
}

// --- 游戏引擎类 ---
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = new Player();
        this.enemies = [];
        this.particles = [];
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('neonDodgerHS')) || 0;
        this.isPlaying = false;
        this.difficulty = 1;
        this.lastTime = 0;

        // UI 元素
        this.overlay = document.getElementById('ui-overlay');
        this.startMenu = document.getElementById('start-menu');
        this.gameOverMenu = document.getElementById('game-over-menu');
        this.hud = document.getElementById('hud');
        this.scoreEl = document.getElementById('current-score');
        this.finalScoreEl = document.getElementById('final-score');
        this.highScoreEl = document.getElementById('high-score');

        console.log('游戏引擎初始化中...');
        this.init();
    }

    init() {
        console.log('正在绑定事件...');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // 输入事件
        const updateTarget = (e) => {
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            this.player.targetX = clientX;
            this.player.targetY = clientY;
        };

        window.addEventListener('mousemove', updateTarget);
        window.addEventListener('touchmove', (e) => {
            updateTarget(e);
            e.preventDefault();
        }, { passive: false });

        // 按钮事件
        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('restart-btn').addEventListener('click', () => this.start());

        // 初始位置
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;
        this.player.targetX = this.player.x;
        this.player.targetY = this.player.y;

        console.log('游戏循环启动');
        requestAnimationFrame((t) => {
            this.lastTime = t;
            this.animate(t);
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    start() {
        this.isPlaying = true;
        this.score = 0;
        this.difficulty = 1;
        this.enemies = [];
        this.particles = [];
        this.overlay.classList.add('hidden');
        this.hud.classList.remove('hidden');

        // 重置时间戳防止第一帧 deltaTime 异常
        this.lastTime = performance.now();

        console.log('游戏开始！');
        // 初始生成一些敌人
        for (let i = 0; i < 5; i++) {
            this.enemies.push(new Enemy(this.canvas.width, 3));
        }
    }

    gameOver() {
        this.isPlaying = false;
        this.overlay.classList.remove('hidden');
        this.startMenu.classList.add('hidden');
        this.gameOverMenu.classList.remove('hidden');
        this.hud.classList.add('hidden');

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('neonDodgerHS', this.highScore);
        }

        this.finalScoreEl.innerText = Math.floor(this.score);
        this.highScoreEl.innerText = Math.floor(this.highScore);

        // 爆炸特效
        this.createExplosion(this.player.x, this.player.y, '#00f2ff', 30);
    }

    createExplosion(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(
                x, y, color,
                random(1, 4),
                { x: random(-5, 5), y: random(-5, 5) }
            ));
        }
    }

    update(deltaTime) {
        if (!this.isPlaying) {
            // 背景粒子效果
            if (Math.random() < 0.05) {
                this.particles.push(new Particle(
                    random(0, this.canvas.width), 0,
                    'rgba(255,255,255,0.1)', random(1, 2),
                    { x: 0, y: random(1, 3) }
                ));
            }
        } else {
            this.score += deltaTime * 0.01;
            this.difficulty = 1 + (this.score / 100);
            this.updateScoreUI();

            // 升级：增加敌人数量
            if (this.enemies.length < Math.min(25, 5 + this.score / 20)) {
                this.enemies.push(new Enemy(this.canvas.width, 3 * this.difficulty));
            }

            this.player.update();

            // 更新敌人
            this.enemies.forEach(enemy => {
                enemy.update();

                // 碰撞检测
                const dx = enemy.x + enemy.size / 2 - this.player.x;
                const dy = enemy.y + enemy.size / 2 - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.player.radius + enemy.size / 2 - 5) {
                    this.gameOver();
                }

                // 越界重置
                if (enemy.y > this.canvas.height) {
                    enemy.reset(this.canvas.width, 3 * this.difficulty);
                }
            });
        }

        // 更新粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    updateScoreUI() {
        this.scoreEl.innerText = Math.floor(this.score);
    }

    draw() {
        // 清除画布
        this.ctx.fillStyle = 'rgba(5, 5, 8, 0.3)'; // 拖尾效果
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => p.draw(this.ctx));

        if (this.isPlaying) {
            this.player.draw(this.ctx);
            this.enemies.forEach(e => e.draw(this.ctx));
        }
    }

    animate(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((t) => this.animate(t));
    }
}

// 启动游戏
window.addEventListener('load', () => {
    new Game();
});
