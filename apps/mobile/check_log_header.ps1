$bytes = [System.IO.File]::ReadAllBytes("d:\GithubProjects\SwissFarm\build_log.txt")
$first4 = $bytes[0..3]
$hex = ""
foreach ($b in $first4) {
    $hex += "{0:X2} " -f $b
}
Write-Host "First 4 bytes: $hex"

$first200 = $bytes[0..199]
$str = [System.Text.Encoding]::ASCII.GetString($first200)
Write-Host "First 200 ASCII chars:"
Write-Host $str