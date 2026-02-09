// 创建像素艺术风格的拳皇背景
// 这个函数会生成一个程序化的像素风格城市街道背景

function createPixelArtBackground() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // 禁用抗锯齿，保持像素风格
    ctx.imageSmoothingEnabled = false;

    // 1. 夜空渐变
    const skyGradient = ctx.createLinearGradient(0, 0, 0, 300);
    skyGradient.addColorStop(0, '#1a1a2e');
    skyGradient.addColorStop(1, '#16213e');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, 1024, 300);

    // 2. 远景建筑剪影
    ctx.fillStyle = '#0f3460';
    for (let i = 0; i < 10; i++) {
        const x = i * 100 + Math.random() * 20;
        const height = 150 + Math.random() * 100;
        ctx.fillRect(x, 300 - height, 80, height);

        // 窗户（黄色小点）
        for (let j = 0; j < 20; j++) {
            if (Math.random() > 0.5) {
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(x + 10 + (j % 4) * 15, 300 - height + Math.floor(j / 4) * 20, 8, 8);
            }
        }
        ctx.fillStyle = '#0f3460';
    }

    // 3. 中景建筑（更近）
    ctx.fillStyle = '#533483';
    for (let i = 0; i < 6; i++) {
        const x = i * 170;
        const height = 200 + Math.random() * 50;
        ctx.fillRect(x, 300 - height, 150, height);

        // 霓虹灯招牌
        if (i % 2 === 0) {
            ctx.fillStyle = '#ff006e';
            ctx.fillRect(x + 20, 300 - height + 30, 110, 40);
            ctx.fillStyle = '#06ffa5';
            ctx.fillRect(x + 30, 300 - height + 40, 90, 20);
        }
        ctx.fillStyle = '#533483';
    }

    // 4. 地面
    const groundGradient = ctx.createLinearGradient(0, 300, 0, 512);
    groundGradient.addColorStop(0, '#2a2a2a');
    groundGradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, 300, 1024, 212);

    // 5. 地面线条（透视）
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 350);
    ctx.lineTo(1024, 350);
    ctx.stroke();

    // 6. 路灯
    for (let i = 0; i < 5; i++) {
        const x = 100 + i * 200;

        // 灯柱
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(x, 250, 8, 100);

        // 灯头
        ctx.fillStyle = '#ffeeaa';
        ctx.beginPath();
        ctx.arc(x + 4, 245, 12, 0, Math.PI * 2);
        ctx.fill();

        // 光晕
        const glowGradient = ctx.createRadialGradient(x + 4, 245, 5, x + 4, 245, 40);
        glowGradient.addColorStop(0, 'rgba(255, 238, 170, 0.8)');
        glowGradient.addColorStop(1, 'rgba(255, 238, 170, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x + 4, 245, 40, 0, Math.PI * 2);
        ctx.fill();
    }

    // 7. 霓虹灯效果（闪烁的招牌）
    const neonSigns = [
        { x: 50, y: 100, text: 'FIGHT', color: '#ff006e' },
        { x: 400, y: 80, text: '格斗', color: '#06ffa5' },
        { x: 750, y: 120, text: 'KOF', color: '#00d9ff' }
    ];

    neonSigns.forEach(sign => {
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = sign.color;
        ctx.fillText(sign.text, sign.x, sign.y);

        // 外发光
        ctx.shadowColor = sign.color;
        ctx.shadowBlur = 20;
        ctx.fillText(sign.text, sign.x, sign.y);
        ctx.shadowBlur = 0;
    });

    // 8. 人群剪影（观众）
    ctx.fillStyle = '#0a0a0a';
    for (let i = 0; i < 15; i++) {
        const x = i * 60 + Math.random() * 20;
        const height = 30 + Math.random() * 20;
        // 头部
        ctx.beginPath();
        ctx.arc(x + 10, 330, 8, 0, Math.PI * 2);
        ctx.fill();
        // 身体
        ctx.fillRect(x + 5, 338, 10, height);
    }

    // 9. 像素化效果（可选）
    // 缩小再放大以创建像素效果
    const pixelCanvas = document.createElement('canvas');
    pixelCanvas.width = 256;  // 原始像素分辨率
    pixelCanvas.height = 128;
    const pixelCtx = pixelCanvas.getContext('2d');
    pixelCtx.imageSmoothingEnabled = false;
    pixelCtx.drawImage(canvas, 0, 0, 256, 128);

    // 放大回原尺寸
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 1024, 512);
    ctx.drawImage(pixelCanvas, 0, 0, 1024, 512);

    return canvas;
}

// 应用到Three.js场景
function applyPixelBackground() {
    const canvas = createPixelArtBackground();
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.NearestFilter;  // 保持像素风格
    texture.magFilter = THREE.NearestFilter;

    // 创建背景平面
    const bgGeo = new THREE.PlaneGeometry(100, 50);
    const bgMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: false
    });
    const background = new THREE.Mesh(bgGeo, bgMat);
    background.position.set(0, 15, -40);
    scene.add(background);

    return background;
}

// 使用方法：
// 在 createArena() 函数中调用：
// applyPixelBackground();
