# Practice 22 - Nginx & HAProxy Load Balancing Tests
param(
    [int]$requests = 10,
    [switch]$verbose
)

function Write-TestHeader {
    param([string]$title)
    Write-Host "`n" -ForegroundColor Cyan
    Write-Host $title -ForegroundColor Cyan
}

function Test-LoadBalancer {
    param(
        [string]$name,
        [string]$url,
        [int]$numRequests
    )
    
    Write-Host "`nTesting $name ($url)" -ForegroundColor Yellow
    Write-Host "Sending $numRequests requests..." -ForegroundColor Gray
    
    $serverCounts = @{}
    $timestamps = @()
    
    for ($i = 1; $i -le $numRequests; $i++) {
        try {
            $response = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
            $server = $response.server
            $timestamp = $response.timestamp
            
            if ($serverCounts.ContainsKey($server)) {
                $serverCounts[$server]++
            } else {
                $serverCounts[$server] = 1
            }
            
            $timestamps += $timestamp
            Write-Host "  Request $i >> $server" -ForegroundColor Green
        } catch {
            Write-Host "  Request $i >> Failed" -ForegroundColor Red
        }
        Start-Sleep -Milliseconds 100
    }
    
    # Display statistics
    Write-Host "`n  Load Distribution:" -ForegroundColor Cyan
    foreach ($server in $serverCounts.Keys | Sort-Object) {
        $count = $serverCounts[$server]
        $percentage = ($count / $numRequests) * 100
        $bar = "=" * [math]::Round($percentage / 5)
        Write-Host "    [$bar] $($server): $count/$numRequests ($([math]::Round($percentage))%)" -ForegroundColor Green
    }
    
    # Check if distribution is balanced
    if ($serverCounts.Count -ge 2) {
        $values = $serverCounts.Values | Sort-Object
        $maxDiff = $values[-1] - $values[0]
        
        if ($maxDiff -le 2) {
            Write-Host "  Status: OK - Well balanced!" -ForegroundColor Green
        }
        else {
            Write-Host "  Status: WARNING - Some imbalance detected (diff: $maxDiff)" -ForegroundColor Yellow
        }
    }
}

Write-TestHeader "Practice 22 - Load Balancing Tests (Nginx and HAProxy)"

# Test Nginx Load Balancer
Test-LoadBalancer -name "Nginx" -url "http://localhost:3091" -numRequests $requests

# Test HAProxy Load Balancer  
Test-LoadBalancer -name "HAProxy" -url "http://localhost:3093" -numRequests $requests