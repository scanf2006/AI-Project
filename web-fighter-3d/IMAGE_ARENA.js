// 使用真实图片背景的场景
// 替换 game.js 中的 createArena() 函数

function createArena() {
    const textureLoader = new THREE.TextureLoader();

    // 1. 简单的地面
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.8,
        metalness: 0.1
    });

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // 2. 加载真实背景图片
    // 您可以选择以下任一背景：
    // - arena_colosseum.jpg (古罗马竞技场)
    // - arena_rooftop.jpg (城市屋顶)
    // - arena_temple.jpg (山顶寺庙)
    // - arena_warehouse.jpg (工业仓库)

    const backgroundImage = './textures/arena_colosseum.jpg';  // 修改这里选择不同背景

    textureLoader.load(backgroundImage, (texture) => {
        // 创建大型背景平面
        const bgGeo = new THREE.PlaneGeometry(150, 75);
        const bgMat = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        });
        const background = new THREE.Mesh(bgGeo, bgMat);
        background.position.set(0, 25, -50);
        scene.add(background);

        console.log('背景图片加载成功:', backgroundImage);
    }, undefined, (error) => {
        console.error('背景图片加载失败:', error);
    });

    // 3. 天空颜色
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 50, 150);

    // 4. 简单的边界墙（可选）
    const wallHeight = 10;
    const wallMat = new THREE.MeshStandardMaterial({
        color: 0x8B7355,
        roughness: 0.9
    });

    // 左墙
    const leftWallGeo = new THREE.BoxGeometry(2, wallHeight, 80);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-40, wallHeight / 2, 0);
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;
    scene.add(leftWall);

    // 右墙
    const rightWall = new THREE.Mesh(leftWallGeo, wallMat);
    rightWall.position.set(40, wallHeight / 2, 0);
    rightWall.receiveShadow = true;
    rightWall.castShadow = true;
    scene.add(rightWall);

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
