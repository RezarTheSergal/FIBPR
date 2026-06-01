# Practice 23 - Nginx Load Balancing with HAProxy Tests
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
    $responseTimes = @()
    
    for ($i = 1; $i -le $numRequests; $i++) {
        try {
            $timer = [System.Diagnostics.Stopwatch]::StartNew()
            $response = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
            $timer.Stop()
            
            $server = $response.server
            $timestamp = $response.timestamp
            $responseTime = $timer.ElapsedMilliseconds
            
            if ($serverCounts.ContainsKey($server)) {
                $serverCounts[$server]++
            } else {
                $serverCounts[$server] = 1
            }
            
            $timestamps += $timestamp
            $responseTimes += $responseTime
            Write-Host "  Request $i >> $server (${responseTime}ms)" -ForegroundColor Green
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
        Write-Host "    [$bar] $server : $count/$numRequests ($([math]::Round($percentage))%)" -ForegroundColor Green
    }
    
    # Response time statistics
    if ($responseTimes.Count -gt 0) {
        $avgTime = [math]::Round(($responseTimes | Measure-Object -Average).Average, 2)
        Write-Host "`n  Response Time Statistics:" -ForegroundColor Cyan
        Write-Host "    Average: ${avgTime}ms" -ForegroundColor Green
        Write-Host "    Min: $([math]::Round(($responseTimes | Measure-Object -Minimum).Minimum, 2))ms" -ForegroundColor Green
        Write-Host "    Max: $([math]::Round(($responseTimes | Measure-Object -Maximum).Maximum, 2))ms" -ForegroundColor Green
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

Write-TestHeader "Practice 23 - Load Balancing Tests (Nginx and HAProxy)"


# Test Nginx Load Balancer
Test-LoadBalancer -name "Nginx" -url "http://localhost:3094" -numRequests $requests

# Test HAProxy Load Balancer  
Test-LoadBalancer -name "HAProxy" -url "http://localhost:3097" -numRequests $requests
