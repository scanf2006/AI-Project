# 修复 game.js 语法错误
$content = Get-Content 'game.js' -Raw -Encoding UTF8

# 修复第919-921行的引号问题
$content = $content -replace "ctx\.fillText\('.*?', 128, 160\);", "ctx.fillText('武', 128, 160);"
$content = $content -replace "ctx\.fillText\('.*?', 128, 280\);", "ctx.fillText('德', 128, 280);"
$content = $content -replace "ctx\.fillText\('.*?', 128, 400\);", "ctx.fillText('道', 128, 400);"

# 保存
$content | Set-Content 'game.js' -Encoding UTF8 -NoNewline

Write-Host "语法错误已修复！" -ForegroundColor Green
Write-Host "请刷新网页。" -ForegroundColor Cyan
