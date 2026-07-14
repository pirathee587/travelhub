# run.ps1 — Load .env then start Spring Boot
# Usage: .\run.ps1  (from any directory)

# Always run from the backend folder (where pom.xml lives)
Set-Location $PSScriptRoot

$envFile = Join-Path $PSScriptRoot ".env"

if (-Not (Test-Path $envFile)) {
    Write-Error ".env file not found at $envFile"
    exit 1
}

Write-Host "Loading environment variables from .env..." -ForegroundColor Cyan

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    # Skip blank lines and comments
    if ($line -and -not $line.StartsWith("#")) {
        $parts = $line -split "=", 2
        if ($parts.Length -eq 2) {
            $key   = $parts[0].Trim()
            $value = $parts[1].Trim()
            [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "  SET $key" -ForegroundColor Green
        }
    }
}

Write-Host "`nStarting Spring Boot..." -ForegroundColor Cyan
mvn spring-boot:run
