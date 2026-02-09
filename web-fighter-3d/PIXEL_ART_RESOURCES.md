# 免费像素艺术背景资源指南

## 推荐网站（完全免费）

### 1. OpenGameArt.org ⭐⭐⭐⭐⭐
**网址**: https://opengameart.org/
**搜索关键词**: 
- "fighting game background"
- "street background pixel"
- "city background pixel art"
- "asian street pixel"

**优点**:
- 完全免费
- 大量格斗游戏风格背景
- CC0/CC-BY许可（可商用）

### 2. itch.io Assets ⭐⭐⭐⭐
**网址**: https://itch.io/game-assets/free
**搜索**: "pixel art background"

**优点**:
- 独立开发者分享
- 很多免费资源包
- 现代像素艺术风格

### 3. Kenney.nl ⭐⭐⭐⭐⭐
**网址**: https://kenney.nl/assets
**特点**:
- 全部CC0许可（公共领域）
- 高质量像素艺术
- 可直接用于商业项目

### 4. CraftPix.net (部分免费) ⭐⭐⭐
**网址**: https://craftpix.net/freebies/
**免费专区**: 每周更新免费资源

### 5. GameArt2D.com ⭐⭐⭐
**网址**: https://www.gameart2d.com/freebies.html
**特点**: 专业级免费素材

---

## 推荐的具体资源包

### 适合拳皇风格的背景：

1. **"Street Fighter Style Backgrounds"**
   - 搜索: OpenGameArt.org
   - 关键词: "street fighter background"

2. **"Pixel Art City Pack"**
   - 搜索: itch.io
   - 包含: 城市街道、建筑物、霓虹灯

3. **"Asian Street Background"**
   - 搜索: OpenGameArt.org
   - 包含: 中国/日本街道元素

---

## 下载后如何使用

### 步骤1: 下载背景图片
保存为: `d:/AI/web-fighter-3d/textures/background.png`

### 步骤2: 在代码中加载
```javascript
// 在 createArena() 函数中
const textureLoader = new THREE.TextureLoader();

// 加载2D背景图片
textureLoader.load('./textures/background.png', (texture) => {
    // 创建背景平面
    const bgGeo = new THREE.PlaneGeometry(100, 50);
    const bgMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
    });
    const background = new THREE.Mesh(bgGeo, bgMat);
    background.position.set(0, 15, -40);
    scene.add(background);
});
```

### 步骤3: 添加视差效果（可选）
```javascript
// 创建多层背景
const layers = [
    { image: 'bg_far.png', z: -50, speed: 0.1 },
    { image: 'bg_mid.png', z: -40, speed: 0.3 },
    { image: 'bg_near.png', z: -30, speed: 0.5 }
];

layers.forEach(layer => {
    textureLoader.load(`./textures/${layer.image}`, (texture) => {
        const geo = new THREE.PlaneGeometry(100, 50);
        const mat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.z = layer.z;
        mesh.userData.scrollSpeed = layer.speed;
        scene.add(mesh);
    });
});
```

---

## 快速搜索链接

直接访问这些链接查找资源：

1. **OpenGameArt 格斗游戏背景**:
   https://opengameart.org/art-search-advanced?keys=fighting+background

2. **itch.io 像素背景**:
   https://itch.io/game-assets/free/tag-pixel-art

3. **Kenney 城市资源包**:
   https://kenney.nl/assets/category:2D

---

## 许可证说明

- **CC0**: 完全公共领域，可随意使用
- **CC-BY**: 需要署名作者
- **CC-BY-SA**: 需要署名，衍生作品需相同许可
- **MIT**: 需要保留许可证文本

大部分游戏开发使用 CC0 或 CC-BY 即可。

---

## 备用方案：AI生成（稍后重试）

如果找不到合适的，我可以稍后帮您生成像素艺术背景图片。
