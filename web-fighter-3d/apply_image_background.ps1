# 应用真实图片背景场景
$imageArenaCode = Get-Content 'IMAGE_ARENA.js' -Raw -Encoding UTF8
$gameJs = Get-Content 'game.js' -Raw -Encoding UTF8

# 替换 createArena 函数
$pattern = '(?s)function createArena\(\) \{.*?\n\}'
$replacement = $imageArenaCode.Trim()

$newContent = $gameJs -replace $pattern, $replacement
$newContent | Set-Content 'game.js' -Encoding UTF8 -NoNewline

Write-Host "场景已替换为真实图片背景！" -ForegroundColor Green
Write-Host ""
Write-Host "已下载的背景图片：" -ForegroundColor Cyan
Write-Host "1. arena_colosseum.jpg - 古罗马竞技场 (当前使用)" -ForegroundColor Yellow
Write-Host "2. arena_rooftop.jpg - 现代城市屋顶"
Write-Host "3. arena_temple.jpg - 山顶寺庙"
Write-Host ""
Write-Host "要更换背景，请修改 game.js 中的这一行：" -ForegroundColor Cyan
Write-Host "const backgroundImage = './textures/arena_colosseum.jpg';" -ForegroundColor White
Write-Host ""
Write-Host "请刷新网页查看效果！" -ForegroundColor Green
