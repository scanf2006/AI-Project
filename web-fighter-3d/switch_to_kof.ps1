# 切换回拳皇街道场景
$kofCode = Get-Content "KOF_ARENA.js" -Raw
$gameJs = Get-Content "game.js" -Raw

# 找到 createArena 函数并替换
$pattern = '(?s)function createArena\(\) \{.*?\n\}'
$replacement = $kofCode.Trim()

$newContent = $gameJs -replace $pattern, $replacement
$newContent | Set-Content "game.js" -Encoding UTF8

Write-Host "已切换回拳皇街道场景！" -ForegroundColor Green
