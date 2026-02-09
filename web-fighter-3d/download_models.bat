@echo off
echo 正在下载 3D 模型文件...
echo.

REM 创建 models 文件夹
if not exist "models" mkdir models

echo [1/2] 下载 RobotExpressive.glb (Player 1)...
curl -L "https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb" -o "models/RobotExpressive.glb"

echo [2/2] 下载 Soldier.glb (Player 2)...
curl -L "https://threejs.org/examples/models/gltf/Soldier.glb" -o "models/Soldier.glb"

echo.
echo 下载完成！模型已保存到 models 文件夹
echo.
pause
