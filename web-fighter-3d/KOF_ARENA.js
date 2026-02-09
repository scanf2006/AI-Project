// 拳皇风格场景创建函数
// 替换 game.js 中的 createArena() 函数

function createArena() {
    // --- 拳皇风格：繁华街道场景 ---
    const textureLoader = new THREE.TextureLoader();

    // 1. 地面 (石板街道)
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.8,
        metalness: 0.2
    });

    // 加载石板纹理
    textureLoader.load(
        'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=1024&q=80',
        (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(15, 15);
            floorMat.map = texture;
            floorMat.needsUpdate = true;
        }
    );

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // 2. 天空 (夜晚城市天空)
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 30, 100);

    // 3. 后方建筑群 (KOF 经典元素)
    const buildingHeight = 25;

    // 主建筑 - 红砖墙
    const mainBuildingGeo = new THREE.BoxGeometry(70, buildingHeight, 3);
    const buildingMat = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9
    });

    textureLoader.load(
        'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=1024&q=80',
        (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(10, 4);
            buildingMat.map = texture;
            buildingMat.needsUpdate = true;
        }
    );

    const mainBuilding = new THREE.Mesh(mainBuildingGeo, buildingMat);
    mainBuilding.position.set(0, buildingHeight / 2, -30);
    mainBuilding.receiveShadow = true;
    mainBuilding.castShadow = true;
    scene.add(mainBuilding);

    // 4. 霓虹灯招牌 (KOF 标志性元素)
    const neonSigns = [
        { text: '格斗', color: 0xff0000, x: -20, y: 18, emissive: 2.0 },
        { text: 'FIGHT', color: 0x00ff00, x: 0, y: 20, emissive: 2.5 },
        { text: '拳皇', color: 0xff00ff, x: 20, y: 18, emissive: 2.0 }
    ];

    neonSigns.forEach(sign => {
        const signGeo = new THREE.PlaneGeometry(8, 3);
        const signMat = new THREE.MeshStandardMaterial({
            color: sign.color,
            emissive: sign.color,
            emissiveIntensity: sign.emissive,
            side: THREE.DoubleSide
        });
        const signMesh = new THREE.Mesh(signGeo, signMat);
        signMesh.position.set(sign.x, sign.y, -29.5);
        scene.add(signMesh);

        // 霓虹灯光源
        const neonLight = new THREE.PointLight(sign.color, 200, 20);
        neonLight.position.set(sign.x, sign.y, -28);
        scene.add(neonLight);

        // 闪烁效果
        setInterval(() => {
            signMat.emissiveIntensity = Math.random() > 0.3 ? sign.emissive : sign.emissive * 0.5;
        }, 200 + Math.random() * 300);
    });

    // 5. 商店橱窗
    const windowGeo = new THREE.PlaneGeometry(4, 5);
    const windowMat = new THREE.MeshStandardMaterial({
        color: 0xffeeaa,
        emissive: 0xffaa00,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.7
    });

    for (let i = 0; i < 6; i++) {
        const window = new THREE.Mesh(windowGeo, windowMat.clone());
        window.position.set(-30 + i * 12, 8, -29.8);
        scene.add(window);
    }

    // 6. 观众剪影 (KOF 经典)
    const crowdGeo = new THREE.BoxGeometry(1.5, 3, 0.5);
    const crowdMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        emissive: 0x000000
    });

    // 左侧观众
    for (let i = 0; i < 8; i++) {
        const person = new THREE.Mesh(crowdGeo, crowdMat);
        person.position.set(
            -35 + Math.random() * 2,
            1.5,
            -25 + i * 3 + Math.random() * 2
        );
        person.castShadow = true;
        scene.add(person);

        // 随机高度变化（模拟不同姿势）
        person.scale.y = 0.8 + Math.random() * 0.4;
    }

    // 右侧观众
    for (let i = 0; i < 8; i++) {
        const person = new THREE.Mesh(crowdGeo, crowdMat);
        person.position.set(
            33 + Math.random() * 2,
            1.5,
            -25 + i * 3 + Math.random() * 2
        );
        person.castShadow = true;
        scene.add(person);
        person.scale.y = 0.8 + Math.random() * 0.4;
    }

    // 7. 街道护栏
    const barrierGeo = new THREE.BoxGeometry(0.3, 1.5, 60);
    const barrierMat = new THREE.MeshStandardMaterial({
        color: 0xffcc00,
        metalness: 0.8,
        roughness: 0.2
    });

    const leftBarrier = new THREE.Mesh(barrierGeo, barrierMat);
    leftBarrier.position.set(-35, 0.75, 0);
    leftBarrier.castShadow = true;
    scene.add(leftBarrier);

    const rightBarrier = new THREE.Mesh(barrierGeo, barrierMat);
    rightBarrier.position.set(35, 0.75, 0);
    rightBarrier.castShadow = true;
    scene.add(rightBarrier);

    // 8. 街灯 (暖色调)
    const streetLightPositions = [
        [-25, 20],
        [25, 20],
        [-25, -10],
        [25, -10]
    ];

    streetLightPositions.forEach(pos => {
        // 灯柱
        const poleGeo = new THREE.CylinderGeometry(0.3, 0.3, 15, 8);
        const poleMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.7,
            roughness: 0.3
        });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(pos[0], 7.5, pos[1]);
        pole.castShadow = true;
        scene.add(pole);

        // 灯头
        const lampGeo = new THREE.SphereGeometry(0.8, 16, 16);
        const lampMat = new THREE.MeshStandardMaterial({
            color: 0xffffee,
            emissive: 0xffffaa,
            emissiveIntensity: 1.5
        });
        const lamp = new THREE.Mesh(lampGeo, lampMat);
        lamp.position.set(pos[0], 15, pos[1]);
        scene.add(lamp);

        // 光源
        const light = new THREE.PointLight(0xffffaa, 400, 40);
        light.position.set(pos[0], 15, pos[1]);
        light.castShadow = true;
        scene.add(light);
    });

    // 9. 地面标线 (格斗区域标记)
    const lineGeo = new THREE.PlaneGeometry(50, 0.5);
    const lineMat = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.6
    });

    const centerLine = new THREE.Mesh(lineGeo, lineMat);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(0, 0.02, 0);
    scene.add(centerLine);

    // 边界线
    const boundaryLine1 = new THREE.Mesh(lineGeo, lineMat);
    boundaryLine1.rotation.x = -Math.PI / 2;
    boundaryLine1.position.set(0, 0.02, -20);
    scene.add(boundaryLine1);

    const boundaryLine2 = new THREE.Mesh(lineGeo, lineMat);
    boundaryLine2.rotation.x = -Math.PI / 2;
    boundaryLine2.position.set(0, 0.02, 20);
    scene.add(boundaryLine2);

    // 10. 环境光调整 (夜晚氛围)
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    // 主光源 (月光效果)
    const moonLight = new THREE.DirectionalLight(0x9999ff, 0.8);
    moonLight.position.set(10, 30, 10);
    moonLight.castShadow = true;
    moonLight.shadow.camera.left = -50;
    moonLight.shadow.camera.right = 50;
    moonLight.shadow.camera.top = 50;
    moonLight.shadow.camera.bottom = -50;
    scene.add(moonLight);
}
