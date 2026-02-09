# 替换场景为日式道场
$dojoCode = Get-Content "DOJO_ARENA.js" -Raw
$gameJs = Get-Content "game.js" -Raw

# 找到 createArena 函数的开始和结束
$pattern = '(?s)function createArena\(\) \{.*?\n\}'
$replacement = $dojoCode.Trim()

# 替换
$newContent = $gameJs -replace $pattern, $replacement

# 保存
$newContent | Set-Content "game.js" -Encoding UTF8

Write-Host "场景已替换为日式武术道场！" -ForegroundColor Green
Write-Host "请刷新网页查看效果。" -ForegroundColor Cyan
