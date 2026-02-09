import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Fighter } from './Fighter.js';
import { ParticleSystem } from './ParticleSystem.js';

// --- Game Constants ---
const GRAVITY = 0.8;
const FLOOR_Y = 0;

// --- Global State ---
let scene, camera, renderer, clock;
let player1, player2;
let particles;
let currentLevel = 1; // Level Tracker
let isGamePending = false; // Waiting for next level or restart

// --- Global Effects Manager ---
const activeEffects = {
    meshes: [],
    intervals: [],
    timeouts: []
};

function clearAllEffects() {
    // 1. 清除所有相关网格
    activeEffects.meshes.forEach(mesh => {
        if (mesh.parent) mesh.parent.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
    });
    activeEffects.meshes = [];

    // 2. 清除所有定时器
    activeEffects.intervals.forEach(id => clearInterval(id));
    activeEffects.intervals = [];

    activeEffects.timeouts.forEach(id => clearTimeout(id));
    activeEffects.timeouts = [];

    // 3. 隐藏文字
    const centerMsg = document.getElementById('center-message');
    if (centerMsg) centerMsg.style.display = 'none';
}

// Basic fighters array
const fighters = [];

// Input State
const keys = {
    w: false, a: false, s: false, d: false,
    space: false,
    j: false, k: false
};

// 妯″瀷鍔犺浇杩借釜
let modelsLoaded = 0;
const totalModels = 2; // Player1 + Player2

// 鐩戝惉妯″瀷鍔犺浇瀹屾垚浜嬩欢
window.addEventListener('modelLoaded', () => {
    modelsLoaded++;
    console.log(`妯″瀷鍔犺浇杩涘害: ${modelsLoaded}/${totalModels}`);

    if (modelsLoaded >= totalModels) {
        // 鎵€鏈夋ā鍨嬪姞杞藉畬鎴愶紝闅愯棌鍔犺浇灞忓箷
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(() => loadingScreen.remove(), 500);
            }
        }, 500); // 寤惰繜0.5绉掞紝璁╃敤鎴风湅鍒?鍔犺浇瀹屾垚"
    }
});

function init() {
    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202040);
    scene.fog = new THREE.Fog(0x202040, 20, 100);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 10, 40);
    camera.lookAt(0, 5, 0);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.0;

    // FORCE CANVAS STYLE
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '0'; // Bottom layer

    document.body.appendChild(renderer.domElement);

    // 4. Lights
    // Warmer ambient light for wood interior
    const ambientLight = new THREE.AmbientLight(0xffeedd, 2.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -25;
    dirLight.shadow.camera.left = -35;
    dirLight.shadow.camera.right = 35;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Warm accent light in the back center
    const pointLight = new THREE.PointLight(0xffaa22, 500, 50);
    pointLight.position.set(0, 10, -28);
    scene.add(pointLight);

    // 5. Environment (The Arena)
    createArena();

    // 6. Particles
    particles = new ParticleSystem(scene);

    // 7. Characters
    createFighters();

    // 7.1 Force Initial UI Update
    updateUI();

    // 8. Event Listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // 9. Start Loop
    clock = new THREE.Clock();
    animate();
}

// 鏃ュ紡姝︽湳閬撳満鍦烘櫙
// 澶嶅埗姝や唬鐮佹浛鎹?game.js 涓殑 createArena() 鍑芥暟 (浠庣117琛屽紑濮?

// 使用真实图片背景的场景
// 替换 game.js 中的 createArena() 函数

function createArena() {
    const textureLoader = new THREE.TextureLoader();

    // 1. 无限地面 (扩大尺寸)
    const floorGeo = new THREE.PlaneGeometry(400, 400);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x2b3a42, // 深色地面，像苔藓或深色泥土
        roughness: 0.9,
        metalness: 0.1
    });

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // 2. 环绕式全景背景 (使用半圆柱体代替平面)
    const backgroundImage = './textures/arena_temple.jpg';

    textureLoader.load(backgroundImage, (texture) => {
        // 半圆柱体，半径90，高度60
        // thetaStart = Math.PI / 2 (从侧面开始), thetaLength = Math.PI (180度包围)
        const bgGeo = new THREE.CylinderGeometry(90, 90, 60, 32, 1, true, -Math.PI / 2, Math.PI);
        const bgMat = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide // 渲染内侧
        });

        // 修正纹理UV，防止拉伸严重 (只取中间部分)
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.repeat.set(1, 1);

        const background = new THREE.Mesh(bgGeo, bgMat);
        background.position.set(0, 20, 0); // 放在中心，把玩家包围
        background.rotation.y = Math.PI; // 旋转对准摄像机
        scene.add(background);
    });

    // 3. 更好的雾效 (指数雾，让地面边缘融合得更好)
    scene.background = new THREE.Color(0x87CEEB);
    // 颜色，密度 (0.015 意味着越远越模糊)
    scene.fog = new THREE.FogExp2(0x87CEEB, 0.012);

    // 4. 竹林 (改为竹海 - 完整植物生成逻辑)
    const bambooHeight = 12;

    // 加载竹子纹理
    const bambooTexture = textureLoader.load('./textures/bamboo_texture.jpg');
    // 注意：我们可以不加载leavesTexture，因为我们使用了几何体叶子（纯色+材质）

    // 创建竹子函数 (几何体叶子+真实竹竿纹理)
    function createBamboo(x, z) {
        const bambooGroup = new THREE.Group();

        // 随机高度 (10 - 14)
        const totalSegments = 5 + Math.floor(Math.random() * 3);

        // 竹竿材质
        const bambooMat = new THREE.MeshStandardMaterial({
            map: bambooTexture, // 使用纹理
            color: 0x8DAA60,    // 混合一点绿色
            roughness: 0.6,
            metalness: 0.1
        });

        // 竹叶材质 (使用几何体)
        const leafMat = new THREE.MeshStandardMaterial({
            color: 0x4A6E22, // 深绿
            roughness: 0.8,
            side: THREE.DoubleSide
        });

        // 竹叶几何体 (复用)
        const leafGeo = new THREE.ConeGeometry(0.08, 0.6, 4);
        leafGeo.rotateX(Math.PI / 2); // 让锥体指向前方，方便旋转

        // 构建竹节
        for (let i = 0; i < totalSegments; i++) {
            // 竹竿段
            const segmentHeight = 2.0;
            // 越往上越细
            const radiusBottom = 0.2 - (i * 0.015);
            const radiusTop = 0.2 - ((i + 1) * 0.015);

            const segmentGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, segmentHeight, 7);
            const segment = new THREE.Mesh(segmentGeo, bambooMat);
            segment.position.y = i * segmentHeight + (segmentHeight / 2);
            segment.castShadow = true;
            bambooGroup.add(segment);

            // 竹节环
            const nodeGeo = new THREE.TorusGeometry(radiusTop, 0.04, 6, 10);
            const nodeMat = new THREE.MeshStandardMaterial({ color: 0x3d4c1f, roughness: 1 });
            const node = new THREE.Mesh(nodeGeo, nodeMat);
            node.position.y = i * segmentHeight + segmentHeight;
            node.rotation.x = Math.PI / 2;
            bambooGroup.add(node);

            // 添加叶子 (只在顶部 1/3 的部分添加)
            if (i > totalSegments * 0.6) {
                // 每个节点长出 2-4 簇叶子
                const branchCount = 2 + Math.floor(Math.random() * 3);
                for (let b = 0; b < branchCount; b++) {
                    const branchGroup = new THREE.Group();
                    branchGroup.position.set(0, i * segmentHeight + segmentHeight * 0.8, 0);
                    branchGroup.rotation.y = (Math.PI * 2 / branchCount) * b + Math.random();
                    branchGroup.rotation.z = Math.PI / 4; // 向外伸出

                    // 每簇 3-5 片叶子
                    for (let l = 0; l < 4; l++) {
                        const leaf = new THREE.Mesh(leafGeo, leafMat);
                        // 随机分散叶子
                        leaf.rotation.y = (Math.random() - 0.5) * 1.5;
                        leaf.rotation.z = (Math.random() - 0.5) * 0.5;
                        leaf.position.x = 0.2; // 稍微远离中心
                        // 叶子压扁一点
                        leaf.scale.set(1, 0.1, 1);
                        branchGroup.add(leaf);
                    }
                    bambooGroup.add(branchGroup);
                }
            }
        }

        bambooGroup.position.set(x, 0, z);

        // 整体随机微倾斜 (风吹的感觉)
        bambooGroup.rotation.z = (Math.random() - 0.5) * 0.1;
        bambooGroup.rotation.x = (Math.random() - 0.5) * 0.1;

        return bambooGroup;
    }

    // 生成大量竹子形成竹海
    // 左侧区域 (x: -120 到 -25)
    for (let i = 0; i < 80; i++) {
        const x = -25 - Math.random() * 95;
        const z = (Math.random() - 0.5) * 120; // 前后深度覆盖
        const bamboo = createBamboo(x, z);

        // 远处的竹子随机缩放
        const dist = Math.abs(x);
        const scale = 1.2 - (dist / 200); // 越远稍微越小
        bamboo.scale.set(scale, scale, scale);
        scene.add(bamboo);
    }

    // 右侧区域 (x: 25 到 120)
    for (let i = 0; i < 80; i++) {
        const x = 25 + Math.random() * 95;
        const z = (Math.random() - 0.5) * 120;
        const bamboo = createBamboo(x, z);

        const dist = Math.abs(x);
        const scale = 1.2 - (dist / 200);
        bamboo.scale.set(scale, scale, scale);
        scene.add(bamboo);
    }

    // 后方背景连接处 (z: -30 到 -60)
    for (let i = 0; i < 30; i++) {
        const x = (Math.random() - 0.5) * 60; // 中间区域
        const z = -25 - Math.random() * 40; // 后方
        // 留出中间格斗舞台
        if (Math.abs(x) < 20 && z > -35) continue;

        const bamboo = createBamboo(x, z);
        scene.add(bamboo);
    }

    // 5. 光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffee, 1.0);
    sunLight.position.set(10, 30, 20);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    scene.add(sunLight);
}

// 娌ラ潚绾圭悊
function createAsphaltTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // 鍩虹娌ラ潚鑹?
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, 512, 512);

    // 鍣偣
    for (let i = 0; i < 3000; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 50}, ${Math.random() * 50}, ${Math.random() * 50}, 0.3)`;
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }

    // 瑁傜汗
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 512, Math.random() * 512);
        for (let j = 0; j < 5; j++) {
            ctx.lineTo(
                Math.random() * 512,
                Math.random() * 512
            );
        }
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    return texture;
}

// 鐮栧绾圭悊
function createBrickTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // 鐮栧潡棰滆壊
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, 512, 512);

    // 缁樺埗鐮栧潡
    const brickW = 128;
    const brickH = 64;
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 4;

    for (let y = 0; y < 512; y += brickH) {
        for (let x = 0; x < 512; x += brickW) {
            const offset = (y / brickH) % 2 === 0 ? 0 : brickW / 2;
            ctx.strokeRect(x + offset, y, brickW, brickH);

            // 鐮栧潡绾圭悊
            ctx.fillStyle = `rgba(139, 69, 19, ${Math.random() * 0.3})`;
            ctx.fillRect(x + offset + 2, y + 2, brickW - 4, brickH - 4);
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    return texture;
}

function createFighters() {
    // --- Fighters ---
    const p1Color = 0xff3333; // Red (Kyo/Ryu)
    const p2Color = 0x3333ff; // Blue (Iori/Terry)

    player1 = new Fighter(p1Color, -3, 0, true); // Facing Right
    player2 = new Fighter(p2Color, 3, 0, false); // Facing Left

    // 浣跨敤鏈湴妯″瀷鏂囦欢 (鏃犻渶缃戠粶鍔犺浇)
    // Robot Expressive (Has 'Punch', 'Running', 'Idle' animations!)
    // Scale 0.8: Balanced size (neither too tiny nor too giant).
    player1.loadModel('./models/RobotExpressive.glb', 0.8);

    // Soldier for Player 2 (AI)
    // Uses fallback "Shoulder Bash" attack since it lacks Punch.
    // Scale 2.5 to match the Robot's bulk.
    player2.loadModel('./models/Soldier.glb', 2.5);

    scene.add(player1.mesh);
    scene.add(player2.mesh);
    fighters.push(player1); // Add player1 to fighters array
    fighters.push(player2); // Add player2 to fighters array
}

function onKeyDown(event) {
    switch (event.key.toLowerCase()) {
        case 'a': keys.a = true; break;
        case 'd': keys.d = true; break;
        case 'w': keys.w = true; break;
        case 's': keys.s = true; break;
        case ' ': keys.space = true; break;
        case 'j': keys.j = true; break;
        case 'k': keys.k = true; break;
    }
}

function onKeyUp(event) {
    switch (event.key.toLowerCase()) {
        case 'a': keys.a = false; break;
        case 'd': keys.d = false; break;
        case 'w': keys.w = false; break;
        case 's': keys.s = false; break;
        case ' ': keys.space = false; break;
        case 'j': keys.j = false; break;
        case 'k': keys.k = false; break;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function checkCollisions() {
    // Check P1 hitting P2
    if (player1.isAttackingHitboxActive && player2.actionState !== 'HIT' && player2.actionState !== 'DEAD') {
        const dx = Math.abs(player1.mesh.position.x - player2.mesh.position.x);
        const dy = Math.abs(player1.mesh.position.y - player2.mesh.position.y);
        const dz = Math.abs(player1.mesh.position.z - player2.mesh.position.z);

        // Z-axis check added: Must be within 1.0 unit of depth
        if (dx < 3.5 && dy < 3 && dz < 1.0) {
            player2.takeDamage(10);
            updateUI();
            player1.isAttackingHitboxActive = false; // Consume hit

            // Particles
            const hitPos = new THREE.Vector3(
                (player1.mesh.position.x + player2.mesh.position.x) / 2,
                player1.mesh.position.y + 2,
                (player1.mesh.position.z + player2.mesh.position.z) / 2
            );
            particles.emit(hitPos, 10, 0xffaa00);

            // Camera Shake
            const originalPos = camera.position.clone();
            const shakeIntensity = 0.5;
            camera.position.x += (Math.random() - 0.5) * shakeIntensity;
            camera.position.y += (Math.random() - 0.5) * shakeIntensity;
            setTimeout(() => {
                camera.position.copy(originalPos);
            }, 50);
        }
    }

    // Check P2 hitting P1
    if (player2.isAttackingHitboxActive && player1.actionState !== 'HIT' && player1.actionState !== 'DEAD') {
        const dx = Math.abs(player2.mesh.position.x - player1.mesh.position.x);
        const dy = Math.abs(player2.mesh.position.y - player1.mesh.position.y);
        const dz = Math.abs(player2.mesh.position.z - player1.mesh.position.z);

        if (dx < 3.5 && dy < 3 && dz < 1.0) {
            player1.takeDamage(10);
            updateUI();
            player2.isAttackingHitboxActive = false;

            const hitPos = new THREE.Vector3(
                (player1.mesh.position.x + player2.mesh.position.x) / 2,
                player1.mesh.position.y + 2,
                (player1.mesh.position.z + player2.mesh.position.z) / 2
            );
            particles.emit(hitPos, 10, 0xff0000);

            // Camera Shake
            const originalPos = camera.position.clone();
            const shakeIntensity = 0.5;
            camera.position.x += (Math.random() - 0.5) * shakeIntensity;
            camera.position.y += (Math.random() - 0.5) * shakeIntensity;
            setTimeout(() => {
                camera.position.copy(originalPos);
            }, 50);
        }
    }
}

function updateUI() {
    const p1elem = document.getElementById('p1-health');
    const p2elem = document.getElementById('p2-health');
    const msgElem = document.getElementById('center-message');

    if (p1elem) p1elem.style.width = player1.hp + '%';
    if (p2elem) p2elem.style.width = player2.hp + '%';

    if (player1.hp <= 0 && player1.actionState !== 'DEFEATED') {
        player1.actionState = 'DEFEATED';
        triggerDefeatEffect(player1);
        handleMatchEnd('P2');
    } else if (player2.hp <= 0 && player2.actionState !== 'DEFEATED') {
        player2.actionState = 'DEFEATED';
        triggerDefeatEffect(player2);
        handleMatchEnd('P1');
    }

    const lvlElem = document.getElementById('level-indicator');
    if (lvlElem) lvlElem.innerText = 'LVL ' + currentLevel;
}

// 鍑昏触鐗规晥
// 击败特效 (禅意风格 - 樱花与光柱)
function triggerDefeatEffect(defeatedFighter) {
    clearAllEffects();
    const winner = (defeatedFighter === player1) ? player2 : player1;
    const winnerPos = winner.mesh.position;

    // 1. 胜利光柱 (柔和的金色光芒)
    const lightGeo = new THREE.CylinderGeometry(3, 3, 30, 32, 1, true);
    const lightMat = new THREE.MeshBasicMaterial({
        color: 0xFFD700, // 金色
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });
    const lightBeam = new THREE.Mesh(lightGeo, lightMat);
    lightBeam.position.copy(winnerPos);
    lightBeam.position.y = 15;
    scene.add(lightBeam);
    activeEffects.meshes.push(lightBeam);

    // 光柱动画 (缩短为2秒)
    let beamTime = 0;
    const beamInterval = setInterval(() => {
        beamTime += 0.05;
        lightBeam.rotation.y += 0.02;
        // 快速淡入淡出
        if (beamTime < 0.5) lightBeam.material.opacity = beamTime * 0.8;
        else if (beamTime > 1.5) lightBeam.material.opacity = Math.max(0, 0.4 - (beamTime - 1.5) * 2);

        if (beamTime > 2.0) {
            clearInterval(beamInterval);
            scene.remove(lightBeam);
        }
    }, 30);
    activeEffects.intervals.push(beamInterval);

    // 2. 樱花雨 (粉色花瓣粒子)
    const petalGeo = new THREE.PlaneGeometry(0.3, 0.3);
    const petalMat = new THREE.MeshBasicMaterial({
        color: 0xFFB7C5, // 樱花粉
        side: THREE.DoubleSide
    });

    const petals = [];
    const petalCount = 150; // 更多花瓣

    // 在全场生成花瓣
    for (let i = 0; i < petalCount; i++) {
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.position.set(
            (Math.random() - 0.5) * 80, // 广阔范围
            20 + Math.random() * 20,    // 从高空飘落
            (Math.random() - 0.5) * 60
        );
        petal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        // 随机速度
        petal.userData = {
            vY: -0.1 - Math.random() * 0.2, // 下落速度
            vR: (Math.random() - 0.5) * 0.1, // 旋转速度
            vX: (Math.random() - 0.5) * 0.1  // 水平漂移
        };
        scene.add(petal);
        petals.push(petal);
        activeEffects.meshes.push(petal);
    }

    // 花瓣动画循环 (缩短为2.5秒)
    let petalTime = 0;
    const petalInterval = setInterval(() => {
        petalTime += 0.035;
        petals.forEach(p => {
            p.position.y += p.userData.vY - 0.05; // 稍微加速下落
            p.position.x += p.userData.vX + Math.sin(petalTime * 3 + p.position.y) * 0.05;
            p.rotation.x += p.userData.vR;
            p.rotation.y += p.userData.vR;

            // 落地
            if (p.position.y < 0.1) {
                p.position.y = 0.1;
                p.userData.vY = 0;
                p.rotation.x = -Math.PI / 2;
            }
        });

        if (petalTime > 2.5) { // 2.5秒后彻底清理
            clearInterval(petalInterval);
            petals.forEach(p => scene.remove(p));
        }
    }, 30);
    activeEffects.intervals.push(petalInterval);

    // 3. 禅意文字提示 (DOM)
    const centerMsg = document.getElementById('center-message');
    if (centerMsg) {
        centerMsg.innerText = (winner === player1 ? '胜' : '败'); // 简单的一个字更有力
        centerMsg.style.display = 'block';
        centerMsg.style.opacity = '0';
        centerMsg.style.color = '#FFD700'; // 金色
        centerMsg.style.fontSize = '120px'; // 巨大
        centerMsg.style.textShadow = '0 0 30px rgba(0, 0, 0, 0.8)';
        centerMsg.style.fontFamily = '"KaiTi", "楷体", serif'; // 书法字体
        centerMsg.style.fontWeight = 'bold';
        centerMsg.style.transition = 'all 1s ease-out';
        centerMsg.style.transform = 'scale(2)'; // 初始放大

        // 动画显示
        const t1 = setTimeout(() => {
            centerMsg.style.opacity = '1';
            centerMsg.style.transform = 'scale(1)'; // 缩小归位
        }, 100);
        activeEffects.timeouts.push(t1);

        // 消失 (2.5秒后消失)
        const t2 = setTimeout(() => {
            centerMsg.style.opacity = '0';
            const t3 = setTimeout(() => centerMsg.style.display = 'none', 500);
            activeEffects.timeouts.push(t3);
        }, 2000);
        activeEffects.timeouts.push(t2);
    }
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Player 1 Input
    const p1Input = {
        left: keys.a,
        right: keys.d,
        up: keys.w,   // Z- (Away)
        down: keys.s, // Z+ (Toward)
        jump: keys.space, // Jump ONLY on Space
        punch: keys.j,
        kick: keys.k
    };

    // Player 2 Input (AI Stub)
    let p2Input = { left: false, right: false, up: false, down: false, jump: false, punch: false, kick: false };

    // AI Logic
    const xDist = player1.mesh.position.x - player2.mesh.position.x;
    const zDist = player1.mesh.position.z - player2.mesh.position.z;

    // Z-Axis Alignment (New)
    if (Math.abs(zDist) > 0.5) {
        if (zDist < 0) p2Input.up = true; // Move Up (Negative Z)
        else p2Input.down = true;       // Move Down (Positive Z)
    }

    const aiBaseAttackChance = 0.02 + (currentLevel * 0.005); // Increase difficulty

    if (Math.abs(xDist) > 2.5) {
        if (xDist > 0) p2Input.right = true;
        else p2Input.left = true;
    } else {
        // Attack chance scales with level
        // Only attack if aligned in Z
        if (Math.abs(zDist) < 1.0) {
            if (Math.random() < aiBaseAttackChance) p2Input.punch = true;
            if (currentLevel > 2 && Math.random() < 0.01) p2Input.kick = true;
        }
    }

    if (player1) player1.update(delta, FLOOR_Y, p1Input);
    if (player2) player2.update(delta, FLOOR_Y, p2Input);

    checkCollisions();
    if (particles) particles.update(delta);

    // Simple Camera Follow (Midpoint)
    if (player1 && player2) {
        const midX = (player1.mesh.position.x + player2.mesh.position.x) / 2;
        camera.position.x += (midX - camera.position.x) * 5 * delta;
        camera.lookAt(midX, 5, 0);
    }

    renderer.render(scene, camera);
}

// --- Level System ---

function nextLevel() {
    currentLevel++;
    isGamePending = false;

    // Show Level Message briefly
    clearAllEffects();
    const msgElem = document.getElementById('center-message');
    if (msgElem) {
        msgElem.style.display = 'block';
        msgElem.innerText = "LEVEL " + currentLevel;
        setTimeout(() => {
            msgElem.style.display = 'none';
        }, 1000);
    }

    // Explicitly update Level Indicator
    const lvlElem = document.getElementById('level-indicator');
    if (lvlElem) lvlElem.innerText = 'LVL ' + currentLevel;

    // Reset Player 1 Position & Heal slightly
    player1.mesh.position.set(-5, 0, 0);
    player1.hp = Math.min(player1.maxHp, player1.hp + 30); // Heal 30 HP
    player1.actionState = 'IDLE';
    player1.facingRight = true;
    player1.updateFacing();

    // Create New Stronger AI
    scene.remove(player2.mesh);
    fighters.pop(); // Remove old P2

    const randomColor = Math.random() * 0xffffff;
    player2 = new Fighter(randomColor, 5, 0, false);

    // AI Opponent Model - 初始隐藏，加载完成后显示
    player2.mesh.visible = false;
    player2.loadModel('./models/Soldier.glb', 2.5, () => {
        player2.mesh.visible = true;
    });

    scene.add(player2.mesh);
    fighters.push(player2);

    updateUI();
}

function restartGame() {
    clearAllEffects();
    currentLevel = 1;
    isGamePending = false;

    const msgElem = document.getElementById('center-message');
    if (msgElem) msgElem.style.display = 'none';

    player1.hp = 100;
    player1.mesh.position.set(-5, 0, 0);
    player1.actionState = 'IDLE';

    player2.hp = 100;
    player2.mesh.position.set(5, 0, 0);
    player2.actionState = 'IDLE';

    updateUI();
}

// Handling Match End
function handleMatchEnd(winner) {
    if (isGamePending) return;
    isGamePending = true;

    const msgElem = document.getElementById('center-message');
    // 移除文本提示，只保留逻辑等待
    if (winner === 'P1') {
        // msgElem.innerHTML = `YOU WIN!<br><span style="font-size:30px">Next Level in 3s...</span>`;
        setTimeout(nextLevel, 3000);
    } else {
        // msgElem.innerHTML = `GAME OVER<br><span style="font-size:30px">Restarting...</span>`;
        setTimeout(restartGame, 3000);
    }
}

// Start game
init();

// --- Procedural Textures ---
function createWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; // Increased resolution
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base wood color
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle grain lines
    ctx.strokeStyle = '#5D4037';
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 600; i++) {
        ctx.lineWidth = Math.random() * 2 + 0.5;
        ctx.beginPath();
        const startX = Math.random() * 1024;
        ctx.moveTo(startX, 0);
        ctx.lineTo(startX + (Math.random() - 0.5) * 60, 1024);
        ctx.stroke();
    }

    // Plank divisions
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 6;
    for (let i = 0; i < 1024; i += 128) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 1024);
        ctx.stroke();
    }

    // Wood knots
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 25; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random() * 1024, Math.random() * 1024, 8, 18, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 3);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function createPaperTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Washi Paper Base
    ctx.fillStyle = '#FEF9E7';
    ctx.fillRect(0, 0, 512, 512);

    // Paper fibers noise
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#D4AC0D';
    for (let i = 0; i < 1200; i++) {
        ctx.beginPath();
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.random() * 12, y + Math.random() * 10);
        ctx.stroke();
    }

    // Shoji Frame (Grid)
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = '#3E2723'; // Dark wood frame
    ctx.lineWidth = 10;

    ctx.strokeRect(0, 0, 512, 512);
    for (let y = 0; y <= 512; y += 128) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }
    for (let x = 0; x <= 512; x += 128) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 1);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function createScrollTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Scroll paper
    ctx.fillStyle = '#EADBC8';
    ctx.fillRect(0, 0, 256, 512);

    // Dark wood ends
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(0, 0, 256, 30); // Top
    ctx.fillRect(0, 482, 256, 30); // Bottom

    // Ancient script placeholder
    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 80px serif';
    ctx.textAlign = 'center';
    ctx.fillText('武', 128, 160);
    ctx.fillText('德', 128, 280);
    ctx.fillText('道', 128, 400);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

// 鍒涘缓鍍忕礌鑹烘湳椋庢牸鐨勬嫵鐨囪儗鏅?
function createPixelArtBackground() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // 绂佺敤鎶楅敮榻匡紝淇濇寔鍍忕礌椋庢牸
    ctx.imageSmoothingEnabled = false;

    // 1. 澶滅┖娓愬彉
    const skyGradient = ctx.createLinearGradient(0, 0, 0, 300);
    skyGradient.addColorStop(0, '#1a1a2e');
    skyGradient.addColorStop(1, '#16213e');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, 1024, 300);

    // 2. 杩滄櫙寤虹瓚鍓奖
    ctx.fillStyle = '#0f3460';
    for (let i = 0; i < 10; i++) {
        const x = i * 100 + Math.random() * 20;
        const height = 150 + Math.random() * 100;
        ctx.fillRect(x, 300 - height, 80, height);

        // 绐楁埛锛堥粍鑹插皬鐐癸級
        for (let j = 0; j < 20; j++) {
            if (Math.random() > 0.5) {
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(x + 10 + (j % 4) * 15, 300 - height + Math.floor(j / 4) * 20, 8, 8);
            }
        }
        ctx.fillStyle = '#0f3460';
    }

    // 3. 涓櫙寤虹瓚锛堟洿杩戯級
    ctx.fillStyle = '#533483';
    for (let i = 0; i < 6; i++) {
        const x = i * 170;
        const height = 200 + Math.random() * 50;
        ctx.fillRect(x, 300 - height, 150, height);

        // 闇撹櫣鐏嫑鐗?
        if (i % 2 === 0) {
            ctx.fillStyle = '#ff006e';
            ctx.fillRect(x + 20, 300 - height + 30, 110, 40);
            ctx.fillStyle = '#06ffa5';
            ctx.fillRect(x + 30, 300 - height + 40, 90, 20);
        }
        ctx.fillStyle = '#533483';
    }

    // 4. 鍦伴潰
    const groundGradient = ctx.createLinearGradient(0, 300, 0, 512);
    groundGradient.addColorStop(0, '#2a2a2a');
    groundGradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, 300, 1024, 212);

    // 5. 鍦伴潰绾挎潯锛堥€忚锛?
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 350);
    ctx.lineTo(1024, 350);
    ctx.stroke();

    // 6. 璺伅
    for (let i = 0; i < 5; i++) {
        const x = 100 + i * 200;

        // 鐏煴
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(x, 250, 8, 100);

        // 鐏ご
        ctx.fillStyle = '#ffeeaa';
        ctx.beginPath();
        ctx.arc(x + 4, 245, 12, 0, Math.PI * 2);
        ctx.fill();

        // 鍏夋檿
        const glowGradient = ctx.createRadialGradient(x + 4, 245, 5, x + 4, 245, 40);
        glowGradient.addColorStop(0, 'rgba(255, 238, 170, 0.8)');
        glowGradient.addColorStop(1, 'rgba(255, 238, 170, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x + 4, 245, 40, 0, Math.PI * 2);
        ctx.fill();
    }

    // 7. 闇撹櫣鐏晥鏋滐紙闂儊鐨勬嫑鐗岋級
    const neonSigns = [
        { x: 50, y: 100, text: 'FIGHT', color: '#ff006e' },
        { x: 400, y: 80, text: '鏍兼枟', color: '#06ffa5' },
        { x: 750, y: 120, text: 'KOF', color: '#00d9ff' }
    ];

    neonSigns.forEach(sign => {
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = sign.color;
        ctx.shadowColor = sign.color;
        ctx.shadowBlur = 20;
        ctx.fillText(sign.text, sign.x, sign.y);
        ctx.shadowBlur = 0;
    });

    // 8. 浜虹兢鍓奖锛堣浼楋級
    ctx.fillStyle = '#0a0a0a';
    for (let i = 0; i < 15; i++) {
        const x = i * 60 + Math.random() * 20;
        const height = 30 + Math.random() * 20;
        // 澶撮儴
        ctx.beginPath();
        ctx.arc(x + 10, 330, 8, 0, Math.PI * 2);
        ctx.fill();
        // 韬綋
        ctx.fillRect(x + 5, 338, 10, height);
    }

    // 9. 鍍忕礌鍖栨晥鏋?
    const pixelCanvas = document.createElement('canvas');
    pixelCanvas.width = 256;
    pixelCanvas.height = 128;
    const pixelCtx = pixelCanvas.getContext('2d');
    pixelCtx.imageSmoothingEnabled = false;
    pixelCtx.drawImage(canvas, 0, 0, 256, 128);

    // 鏀惧ぇ鍥炲師灏哄
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 1024, 512);
    ctx.drawImage(pixelCanvas, 0, 0, 1024, 512);

    // 鍒涘缓绾圭悊
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    // 鍒涘缓鑳屾櫙骞抽潰
    const bgGeo = new THREE.PlaneGeometry(120, 60);
    const bgMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: false
    });
    const background = new THREE.Mesh(bgGeo, bgMat);
    background.position.set(0, 20, -45);
    scene.add(background);

    console.log('鍍忕礌鑹烘湳鑳屾櫙宸叉坊鍔狅紒');
}

