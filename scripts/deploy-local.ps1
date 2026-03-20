param(
  [int]$HealthTimeoutSeconds = 180
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
Set-Location $rootDir

function Parse-EnvFile {
  param([string]$Path)
  $map = @{}
  if (-not (Test-Path $Path)) {
    return $map
  }
  foreach ($line in Get-Content $Path) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    if ($line.TrimStart().StartsWith("#")) { continue }
    $idx = $line.IndexOf("=")
    if ($idx -lt 0) { continue }
    $key = $line.Substring(0, $idx).Trim()
    $value = $line.Substring($idx + 1).Trim()
    $map[$key] = $value
  }
  return $map
}

function Invoke-StatusCode {
  param(
    [string]$Method,
    [string]$Uri,
    [string]$Body = "",
    [string]$ContentType = "",
    [Microsoft.PowerShell.Commands.WebRequestSession]$WebSession
  )

  $params = @{
    Method = $Method
    Uri = $Uri
    TimeoutSec = 20
  }
  if ($Body -ne "") { $params["Body"] = $Body }
  if ($ContentType -ne "") { $params["ContentType"] = $ContentType }
  if ($null -ne $WebSession) { $params["WebSession"] = $WebSession }

  try {
    $response = Invoke-WebRequest @params
    return [int]$response.StatusCode
  } catch {
    if ($_.Exception.Response) {
      if ($_.Exception.Response.StatusCode.value__) {
        return [int]$_.Exception.Response.StatusCode.value__
      }
      return [int]$_.Exception.Response.StatusCode
    }
    throw
  }
}

Write-Host "Validating compose configuration..."
docker compose config | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "docker compose config failed."
}

Write-Host "Building and starting containers..."
docker compose up -d --build
if ($LASTEXITCODE -ne 0) {
  throw "docker compose up failed."
}

$services = @("website", "admin")
$deadline = (Get-Date).AddSeconds($HealthTimeoutSeconds)

Write-Host "Waiting for healthy containers..."
while ((Get-Date) -lt $deadline) {
  $allHealthy = $true
  foreach ($svc in $services) {
    $containerId = (docker compose ps -q $svc).Trim()
    if ([string]::IsNullOrWhiteSpace($containerId)) {
      $allHealthy = $false
      continue
    }
    $health = (docker inspect --format "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}" $containerId).Trim()
    if ($health -ne "healthy") {
      $allHealthy = $false
    }
  }

  if ($allHealthy) { break }
  Start-Sleep -Seconds 3
}

foreach ($svc in $services) {
  $containerId = (docker compose ps -q $svc).Trim()
  if ([string]::IsNullOrWhiteSpace($containerId)) {
    throw "Container for service '$svc' was not found."
  }
  $health = (docker inspect --format "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}" $containerId).Trim()
  if ($health -ne "healthy") {
    throw "Service '$svc' is not healthy (status: $health)."
  }
}

Write-Host "Running smoke checks..."
$websiteRoot = Invoke-StatusCode -Method "GET" -Uri "http://127.0.0.1:5500/"
if ($websiteRoot -ne 200) { throw "Website root check failed ($websiteRoot)." }

$websiteConfigGet = Invoke-StatusCode -Method "GET" -Uri "http://127.0.0.1:5500/api/config"
if ($websiteConfigGet -ne 200) { throw "Website config GET failed ($websiteConfigGet)." }

$websiteConfigPost = Invoke-StatusCode -Method "POST" -Uri "http://127.0.0.1:5500/api/config" -Body "{}" -ContentType "application/json"
if ($websiteConfigPost -ne 403) { throw "Website config POST expected 403, got $websiteConfigPost." }

$adminConfigNoAuth = Invoke-StatusCode -Method "GET" -Uri "http://127.0.0.1:5600/api/config"
if ($adminConfigNoAuth -ne 401) { throw "Admin config no-auth expected 401, got $adminConfigNoAuth." }

$envMap = Parse-EnvFile -Path ".env"
$adminUser = if ($envMap.ContainsKey("ADMIN_USER")) { $envMap["ADMIN_USER"] } else { "admin" }
$adminPass = if ($envMap.ContainsKey("ADMIN_PASS")) { $envMap["ADMIN_PASS"] } else { "admin" }

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$loginBody = @{ user = $adminUser; pass = $adminPass } | ConvertTo-Json -Compress
$loginStatus = Invoke-StatusCode -Method "POST" -Uri "http://127.0.0.1:5600/api/admin/login" -Body $loginBody -ContentType "application/json" -WebSession $session
if ($loginStatus -ne 200) { throw "Admin login failed ($loginStatus)." }

$adminConfigAuth = Invoke-StatusCode -Method "GET" -Uri "http://127.0.0.1:5600/api/config" -WebSession $session
if ($adminConfigAuth -ne 200) { throw "Admin config auth check failed ($adminConfigAuth)." }

Write-Host ""
Write-Host "Deployment complete and verified."
Write-Host "Website: http://localhost:5500"
Write-Host "Admin:   http://localhost:5600/admin"
