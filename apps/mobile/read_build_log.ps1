$filePath = "d:\GithubProjects\SwissFarm\build_log.txt"
$outputPath = "d:\GithubProjects\SwissFarm\build_log_decompressed.txt"

try {
    # Try to read as gzip
    $input = [System.IO.File]::OpenRead($filePath)
    $gzip = New-Object System.IO.Compression.GzipStream($input, [System.IO.Compression.CompressionMode]::Decompress)
    $reader = New-Object System.IO.StreamReader($gzip)
    $content = $reader.ReadToEnd()
    $reader.Close()
    $gzip.Close()
    $input.Close()
    
    [System.IO.File]::WriteAllText($outputPath, $content)
    Write-Host "Decompressed and saved to $outputPath"
    Write-Host "File size: $($content.Length) characters"
    
    # Search for errors
    $lines = $content -split "`n"
    $errorLines = $lines | Where-Object { $_ -match 'FAILURE|error|Error|What went wrong|Gradle build|FAILED' }
    Write-Host "=== Error lines found: ==="
    $errorLines | ForEach-Object { Write-Host $_ }
}
catch {
    Write-Host "Not a gzip file or error: $_"
    # Try reading as plain text
    try {
        $content = [System.IO.File]::ReadAllText($filePath)
        $lines = $content -split "`n"
        $errorLines = $lines | Where-Object { $_ -match 'FAILURE|error|Error|What went wrong' }
        Write-Host "=== Error lines found: ==="
        $errorLines | ForEach-Object { Write-Host $_ }
    }
    catch {
        Write-Host "Cannot read file: $_"
    }
}