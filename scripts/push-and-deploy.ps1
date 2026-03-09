param(
  [string]$CommitMessage = "chore: update deployment and security setup",
  [string]$Branch = "main",
  [string]$Remote = "origin",
  [string]$WebhookUrl = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
Set-Location $rootDir

function Run-Git {
  param([string[]]$Args)
  & git @Args
  if ($LASTEXITCODE -ne 0) {
    throw "git $($Args -join ' ') failed."
  }
}

& git rev-parse --is-inside-work-tree | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "Current folder is not a git repository. Clone the real repo (with .git) and run again."
}

Run-Git -Args @("add", "-A")

$changes = & git status --porcelain
if ($changes) {
  Run-Git -Args @("commit", "-m", $CommitMessage)
} else {
  Write-Host "No local changes to commit."
}

Run-Git -Args @("push", $Remote, "HEAD:$Branch")
Write-Host "Pushed to $Remote/$Branch"

if ([string]::IsNullOrWhiteSpace($WebhookUrl)) {
  $WebhookUrl = $env:COOLIFY_WEBHOOK_PROD
}

if (-not [string]::IsNullOrWhiteSpace($WebhookUrl)) {
  Write-Host "Triggering Coolify webhook..."
  Invoke-RestMethod -Method Post -Uri $WebhookUrl -TimeoutSec 30 | Out-Null
  Write-Host "Coolify webhook triggered."
} else {
  Write-Host "No webhook URL provided. Skipping webhook trigger."
  Write-Host "Set -WebhookUrl or COOLIFY_WEBHOOK_PROD env var to trigger deployment automatically."
}
