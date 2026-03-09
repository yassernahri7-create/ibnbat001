param(
  [string]$Domain = "ibnbatoutaweb.com",
  [string]$AdminSubdomain = "admin",
  [string]$AdminUser = "admin",
  [string]$EnvPath = ".env"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$envExamplePath = Join-Path $rootDir ".env.example"
$envFilePath = Join-Path $rootDir $EnvPath

if (-not (Test-Path $envExamplePath)) {
  throw "Missing .env.example at $envExamplePath"
}

if (-not (Test-Path $envFilePath)) {
  Copy-Item $envExamplePath $envFilePath
}

function Set-KeyValue {
  param(
    [string]$Content,
    [string]$Key,
    [string]$Value
  )

  $pattern = "(?m)^$([regex]::Escape($Key))=.*$"
  $line = "$Key=$Value"
  $regex = [regex]::new($pattern)

  if ($regex.IsMatch($Content)) {
    return $regex.Replace($Content, { param($m) $line }, 1)
  }

  if ($Content.Length -gt 0 -and -not $Content.EndsWith("`n")) {
    $Content += "`n"
  }
  return $Content + $line + "`n"
}

function New-StrongPassword {
  param([int]$Length = 32)

  while ($true) {
    $bytes = New-Object byte[] 64
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    $candidate = ([Convert]::ToBase64String($bytes) -replace "[^A-Za-z0-9]", "")
    if ($candidate.Length -ge $Length) {
      return $candidate.Substring(0, $Length)
    }
  }
}

$content = Get-Content -Path $envFilePath -Raw
$adminDomain = "$AdminSubdomain.$Domain"

$content = Set-KeyValue -Content $content -Key "WEBSITE_DOMAIN" -Value $Domain
$content = Set-KeyValue -Content $content -Key "ADMIN_DOMAIN" -Value $adminDomain
$content = Set-KeyValue -Content $content -Key "ADMIN_USER" -Value $AdminUser

$adminPassMatch = [regex]::Match($content, "(?m)^ADMIN_PASS=(.*)$")
$adminPass = if ($adminPassMatch.Success) { $adminPassMatch.Groups[1].Value.Trim() } else { "" }

if ([string]::IsNullOrWhiteSpace($adminPass) -or $adminPass -eq "admin" -or $adminPass -eq "change_this_password") {
  $adminPass = New-StrongPassword
}

$content = Set-KeyValue -Content $content -Key "ADMIN_PASS" -Value $adminPass
Set-Content -Path $envFilePath -Value $content -Encoding UTF8

Write-Host "Updated $envFilePath"
Write-Host "WEBSITE_DOMAIN=$Domain"
Write-Host "ADMIN_DOMAIN=$adminDomain"
Write-Host "ADMIN_USER=$AdminUser"
Write-Host "ADMIN_PASS generated or preserved in .env"
