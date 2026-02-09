# Web Fighter 3D (3D 网页格斗游戏)

这是一个基于 Three.js 开发的、高沉浸感的 3D 网页格斗游戏。项目融合了现代 3D 渲染技术与经典的格斗游戏机制，并提供了丰富的场景定制功能。

## 🌟 核心特性

- **沉浸式环境**：采用全景包围背景（Cylindrical Background）和指数雾（FogExp2）效果，打造无边际的真实感场景。
- **动态植物系统**：程序化生成的竹林系统，具有随机高度、倾斜度、节理和多层几何体叶子，形成壮阔的“竹海”景观。
- **禅意特效系统**：
    - **樱花雨**：胜利时粉色樱花瓣在全场缓缓飘落。
    - **胜利光柱**：金色上升光束照耀获胜者。
    - **文字特效**：优雅的书法风格“胜/败”提示。
- **流畅的模型加载**：针对 3D 模型（GLTF/GLB）加载进行了优化，消除了进入下一关时产生的模型闪烁和瞬间位移。
- **格斗机制**：支持移动、跳跃、防御（计划中）、攻击动作，并具有完整的血量系统和关卡升级系统。
- **AI 系统**：具有挑战性的 AI 对手，每一关其生命值和反应能力都会得到提升。

## 🛠️ 技术栈

- **核心引擎**：Three.js (WebGL)
- **编程语言**：现代 ES6+ JavaScript
- **资源格式**：GLTF/GLB (模型), JPEG/PNG (纹理/全景图)
- **环境搭建**：Vanilla JS (无需复杂框架，部署简单)

## 🎮 操作指南

| 按键 | 动作 |
| --- | --- |
| `W` | 后退（远离镜头） |
| `S` | 前进（靠近镜头） |
| `A` | 向左移动 |
| `D` | 向右移动 |
| `Space` | 跳跃 |
| `J` | 轻拳 |
| `K` | 重踢 |

## 🚀 快速启动

1. **获取源码**：
   ```bash
   git clone [project-url]
   ```

2. **资源准备**：
   运行 `download_backgrounds.bat` 和 `download_models.bat` 下载所需高清背景图片和 3D 模型资源。

3. **启动服务**：
   由于浏览器安全限制（CORS），必须通过本地服务器运行。
   - 如果安装了 Node.js，可以使用 `npx http-server`。
   - 或者直接运行 `start_game.bat`（如果已有预设脚本）。

4. **访问游戏**：
   打开浏览器，访问 `http://localhost:8080` (或其它相应端口)。

## 📁 项目结构

- `game.js`: 游戏主逻辑、场景管理与渲染循环。
- `Fighter.js`: 战斗角色类，处理模型加载、动画状态机与物理碰撞。
- `ParticleSystem.js`: 基础粒子发射系统。
- `textures/`: 存放场景纹理及全景图背景。
- `models/`: 存放 3D 角色模型（如 Soldier.glb）。

## 🎨 场景定制

开发者可以通过修改 `game.js` 中的背景图 URL 来快速切换战斗舞台。项目内置了对“山顶古寺”、“仓库大厂”等多种氛围的支持。

---
---
*由 Antigravity 助手构建 - 开启你的武道之旅*

---

# Web Fighter 3D

A high-immersion 3D web-based fighting game built with Three.js. This project blends modern 3D rendering techniques with classic fighting game mechanics, featuring extensive scene customization.

## 🌟 Key Features

- **Immersive Environment**: Utilizing a cylindrical panoramic background and exponential fog (FogExp2) to create a seamless, expansive world.
- **Dynamic Vegetation System**: A procedural bamboo forest with randomized heights, tilts, joints, and multi-layered geometric leaves, creating a vast "Bamboo Sea."
- **Zen Visual Effects**:
    - **Sakura Rain**: Pink cherry blossom petals gently drift across the stage upon victory.
    - **Victory Beam**: A soft golden beam of light illuminates the winner.
    - **Calligraphy Text**: Elegant "胜" (Win) and "败" (Loss) prompts in traditional calligraphy style.
- **Smooth Model Loading**: Optimized GLTF/GLB loading that eliminates model flickering or erratic movement when transitioning between levels.
- **Fighting Mechanics**: Support for movement, jumping, blocking (planned), and attack animations, with a full HP system and level progression.
- **AI System**: Challenging AI opponents that scale in health and reaction speed with each level.

## 🛠️ Tech Stack

- **Core Engine**: Three.js (WebGL)
- **Programming Language**: Modern ES6+ JavaScript
- **Asset Formats**: GLTF/GLB (Models), JPEG/PNG (Textures/Panoramas)
- **Environment**: Vanilla JS (Simple deployment, no complex frameworks required)

## 🎮 Controls

| Key | Action |
| --- | --- |
| `W` | Move Backward (Away from camera) |
| `S` | Move Forward (Toward camera) |
| `A` | Move Left |
| `D` | Move Right |
| `Space` | Jump |
| `J` | Light Punch |
| `K` | Heavy Kick |

## 🚀 Quick Start

1. **Clone the Source**:
   ```bash
   git clone [project-url]
   ```

2. **Prepare Assets**:
   Run `download_backgrounds.bat` and `download_models.bat` to download high-definition backgrounds and 3D models.

3. **Start a Local Server**:
   Due to browser CORS restrictions, the game must be run via a local server.
   - If you have Node.js installed, use `npx http-server`.
   - Alternatively, run `start_game.bat` if available.

4. **Access the Game**:
   Open your browser and navigate to `http://localhost:8080` (or the relevant port).

## 📁 Project Structure

- `game.js`: Core game logic, scene management, and render loop.
- `Fighter.js`: Fighter class handling model loading, animation state machines, and physics.
- `ParticleSystem.js`: Basic particle emission system.
- `textures/`: Asset directory for textures and panoramic backgrounds.
- `models/`: Asset directory for 3D character models (e.g., Soldier.glb).

## 🎨 Customization

Developers can quickly switch battle stages by modifying the background image URLs in `game.js`. The project includes built-in support for various atmospheres like "Mountain Temple" and "Industrial Warehouse."

---
*Built by Antigravity Assistant - Begin your martial arts journey.*

