@echo off
echo 正在下载格斗游戏背景图片...
echo.

REM 创建 textures 文件夹
if not exist "textures" mkdir textures

echo 下载选项：
echo.
echo 1. 古罗马竞技场 (Unsplash)
echo 2. 现代城市屋顶 (Unsplash)  
echo 3. 山顶寺庙 (Unsplash)
echo 4. 工业仓库 (Unsplash)
echo.

REM 下载多个高质量背景供选择
echo 正在下载背景1: 古罗马竞技场...
curl -L "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&q=80" -o "textures/arena_colosseum.jpg"

echo 正在下载背景2: 现代城市屋顶...
curl -L "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80" -o "textures/arena_rooftop.jpg"

echo 正在下载背景3: 山顶寺庙...
curl -L "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1920&q=80" -o "textures/arena_temple.jpg"

echo 正在下载背景4: 工业仓库...
curl -L "https://images.unsplash.com/photo-1586864387634-1a7b29c8d0b7?w=1920&q=80" -o "textures/arena_warehouse.jpg"

echo.
echo 下载完成！
echo 背景图片已保存到 textures 文件夹
echo.
echo 可用的背景：
echo - arena_colosseum.jpg (古罗马竞技场)
echo - arena_rooftop.jpg (城市屋顶)
echo - arena_temple.jpg (山顶寺庙)
echo - arena_warehouse.jpg (工业仓库)
echo.
pause
