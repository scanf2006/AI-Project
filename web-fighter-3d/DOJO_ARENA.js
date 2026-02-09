// 日式武术道场场景
// 复制此代码替换 game.js 中的 createArena() 函数 (从第117行开始)

function createArena() {
    // --- 日式武术道场场景 ---
    const textureLoader = new THREE.TextureLoader();

    // 1. 木质地板 (榻榻米风格)
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0xd4a574,
        roughness: 0.9,
        metalness: 0.0
    });

    textureLoader.load(
        'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=1024&q=80',
        (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(20, 20);
            floorMat.map = texture;
            floorMat.needsUpdate = true;
        }
    );

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // 2. 天空 (白天室内光)
    scene.background = new THREE.Color(0xf5f5dc);
    scene.fog = new THREE.Fog(0xf5f5dc, 50, 150);

    // 3. 后墙 (木质墙壁)
    const wallHeight = 15;
    const backWallGeo = new THREE.BoxGeometry(60, wallHeight, 1);
    const wallMat = new THREE.MeshStandardMaterial({
        color: 0x8B7355,
        roughness: 0.8
    });

    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, wallHeight / 2, -25);
    backWall.receiveShadow = true;
    backWall.castShadow = true;
    scene.add(backWall);

    // 4. 纸门 (障子门)
    const doorGeo = new THREE.PlaneGeometry(4, 8);
    const doorMat = new THREE.MeshStandardMaterial({
        color: 0xfff8dc,
        transparent: true,
        opacity: 0.9,
        emissive: 0xffffee,
        emissiveIntensity: 0.3
    });

    // 三扇纸门
    for (let i = 0; i < 3; i++) {
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(-12 + i * 12, 4, -24.9);
        scene.add(door);

        // 门框
        const frameGeo = new THREE.BoxGeometry(4.2, 8.2, 0.1);
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x3a2a1a
        });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.set(-12 + i * 12, 4, -24.95);
        scene.add(frame);
    }

    // 5. 武器架
    const weaponRackGeo = new THREE.BoxGeometry(0.3, 6, 0.3);
    const rackMat = new THREE.MeshStandardMaterial({
        color: 0x3a2a1a,
        roughness: 0.7
    });

    // 左侧武器架
    const leftRack = new THREE.Mesh(weaponRackGeo, rackMat);
    leftRack.position.set(-25, 3, -20);
    leftRack.castShadow = true;
    scene.add(leftRack);

    // 木剑
    const swordGeo = new THREE.BoxGeometry(0.2, 4, 0.2);
    const swordMat = new THREE.MeshStandardMaterial({
        color: 0x8B4513
    });

    for (let i = 0; i < 3; i++) {
        const sword = new THREE.Mesh(swordGeo, swordMat);
        sword.position.set(-25 + i * 0.5, 5, -20);
        sword.rotation.z = Math.PI / 6;
        sword.castShadow = true;
        scene.add(sword);
    }

    // 右侧武器架
    const rightRack = new THREE.Mesh(weaponRackGeo, rackMat);
    rightRack.position.set(25, 3, -20);
    rightRack.castShadow = true;
    scene.add(rightRack);

    for (let i = 0; i < 3; i++) {
        const sword = new THREE.Mesh(swordGeo, swordMat);
        sword.position.set(25 - i * 0.5, 5, -20);
        sword.rotation.z = -Math.PI / 6;
        sword.castShadow = true;
        scene.add(sword);
    }

    // 6. 盆栽
    const potGeo = new THREE.CylinderGeometry(0.8, 0.6, 1, 8);
    const potMat = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.8
    });

    // 左前方盆栽
    const pot1 = new THREE.Mesh(potGeo, potMat);
    pot1.position.set(-20, 0.5, 15);
    pot1.castShadow = true;
    scene.add(pot1);

    // 植物（简化的球体）
    const plantGeo = new THREE.SphereGeometry(1.2, 8, 8);
    const plantMat = new THREE.MeshStandardMaterial({
        color: 0x2d5016,
        roughness: 0.9
    });
    const plant1 = new THREE.Mesh(plantGeo, plantMat);
    plant1.position.set(-20, 2, 15);
    plant1.castShadow = true;
    scene.add(plant1);

    // 右前方盆栽
    const pot2 = new THREE.Mesh(potGeo, potMat);
    pot2.position.set(20, 0.5, 15);
    pot2.castShadow = true;
    scene.add(pot2);

    const plant2 = new THREE.Mesh(plantGeo, plantMat);
    plant2.position.set(20, 2, 15);
    plant2.castShadow = true;
    scene.add(plant2);

    // 7. 挂轴（书法）
    const scrollGeo = new THREE.PlaneGeometry(3, 8);
    const scrollMat = new THREE.MeshStandardMaterial({
        color: 0xfff8e7,
        roughness: 0.9
    });

    const scroll = new THREE.Mesh(scrollGeo, scrollMat);
    scroll.position.set(0, 8, -24.8);
    scene.add(scroll);

    // 挂轴边框
    const scrollFrameGeo = new THREE.BoxGeometry(3.2, 8.2, 0.1);
    const scrollFrameMat = new THREE.MeshStandardMaterial({
        color: 0x8B0000
    });
    const scrollFrame = new THREE.Mesh(scrollFrameGeo, scrollFrameMat);
    scrollFrame.position.set(0, 8, -24.85);
    scene.add(scrollFrame);

    // 8. 侧墙柱子
    const pillarGeo = new THREE.BoxGeometry(1, wallHeight, 1);
    const pillarMat = new THREE.MeshStandardMaterial({
        color: 0x3a2a1a,
        roughness: 0.7
    });

    // 左侧柱子
    for (let i = 0; i < 3; i++) {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(-28, wallHeight / 2, -15 + i * 15);
        pillar.castShadow = true;
        scene.add(pillar);
    }

    // 右侧柱子
    for (let i = 0; i < 3; i++) {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(28, wallHeight / 2, -15 + i * 15);
        pillar.castShadow = true;
        scene.add(pillar);
    }

    // 9. 格斗区域标记（圆形）
    const ringGeo = new THREE.RingGeometry(15, 15.5, 64);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0x8B4513,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, 0.02, 0);
    scene.add(ring);

    // 10. 天花板横梁
    const beamGeo = new THREE.BoxGeometry(70, 0.5, 1);
    const beamMat = new THREE.MeshStandardMaterial({
        color: 0x3a2a1a,
        roughness: 0.6
    });

    for (let i = 0; i < 3; i++) {
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(0, 14, -10 + i * 10);
        beam.castShadow = true;
        scene.add(beam);
    }

    // 11. 灯笼照明
    const lanternPositions = [
        [-15, 12, -10],
        [15, 12, -10],
        [-15, 12, 10],
        [15, 12, 10]
    ];

    lanternPositions.forEach(pos => {
        // 灯笼外壳
        const lanternGeo = new THREE.CylinderGeometry(0.8, 0.8, 2, 6);
        const lanternMat = new THREE.MeshStandardMaterial({
            color: 0xff6347,
            emissive: 0xff6347,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });
        const lantern = new THREE.Mesh(lanternGeo, lanternMat);
        lantern.position.set(pos[0], pos[1], pos[2]);
        scene.add(lantern);

        // 灯笼光源
        const light = new THREE.PointLight(0xffaa77, 200, 25);
        light.position.set(pos[0], pos[1], pos[2]);
        light.castShadow = true;
        scene.add(light);
    });

    // 12. 环境光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // 主光源（天窗效果）
    const sunLight = new THREE.DirectionalLight(0xffffee, 1.2);
    sunLight.position.set(5, 20, 10);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    scene.add(sunLight);
}
