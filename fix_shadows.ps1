$path = "d:\antigravity\Web Bantuan Sosial\resources\js\Components\App\components"
$files = Get-ChildItem -Path $path -Recurse -Filter *.tsx

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $newContent = $content -replace 'shadow-\[[^\]]+\]', 'shadow-none'
    [IO.File]::WriteAllText($file.FullName, $newContent)
    Write-Host "Processed $($file.FullName)"
}
