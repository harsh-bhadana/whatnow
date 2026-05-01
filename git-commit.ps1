param (
    [Parameter(Mandatory=$true)]
    [string]$Message
)

$stateFile = ".commit-state.json"

if (-not (Test-Path $stateFile)) {
    # Initialize state
    $state = @{
        CurrentDate = "2026-05-01T09:00:00"
        CommitsToday = 0
        TargetToday = (Get-Random -Minimum 4 -Maximum 8)
    }
} else {
    $state = Get-Content $stateFile | ConvertFrom-Json
}

$currentDate = [datetime]$state.CurrentDate

if ($state.CommitsToday -ge $state.TargetToday) {
    # Move to next day
    $currentDate = $currentDate.Date.AddDays(1).AddHours(9) # Start around 9 AM
    $state.CommitsToday = 0
    $state.TargetToday = (Get-Random -Minimum 4 -Maximum 8)
}

# Add some random minutes for the current commit
$randomMinutes = Get-Random -Minimum 15 -Maximum 120
$commitDate = $currentDate.AddMinutes($randomMinutes)

# Update state for next time
$state.CurrentDate = $commitDate.ToString("yyyy-MM-ddTHH:mm:ss")
$state.CommitsToday += 1

$state | ConvertTo-Json | Set-Content $stateFile

# Set environment variables for Git
$env:GIT_AUTHOR_DATE = $commitDate.ToString("yyyy-MM-ddTHH:mm:ss")
$env:GIT_COMMITTER_DATE = $commitDate.ToString("yyyy-MM-ddTHH:mm:ss")

# Execute git commit
git commit -m $Message

Write-Host "Committed as $($commitDate.ToString('yyyy-MM-dd HH:mm:ss')) (Commit $($state.CommitsToday) of $($state.TargetToday) for today)"
