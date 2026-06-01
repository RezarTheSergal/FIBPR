# Practice 21 - JWT Authentication with Redis Tests
param(
    [string]$baseUrl = "http://localhost:3090",
    [switch]$verbose
)

function Write-TestHeader {
    param([string]$title)
    Write-Host "`n" -ForegroundColor Cyan
    Write-Host $title -ForegroundColor Cyan
}

function Write-TestResult {
    param([string]$test, [bool]$passed, [object]$response)
    if ($passed) {
        Write-Host "Passed $test" -ForegroundColor Green
    } else {
        Write-Host "Failed $test" -ForegroundColor Red
    }
    if ($verbose -and $response) {
        Write-Host "  Response: $(ConvertTo-Json $response -Compress)" -ForegroundColor Gray
    }
}

Write-TestHeader "Practice 21 - JWT Authentication with Redis Tests"

$testUsername = "testuser_$(Get-Random)"
$testPassword = "TestPassword123!"
$testEmail = "test_$(Get-Random)@example.com"

# Test 1: Register User
Write-Host "Registering new user..." -ForegroundColor Yellow
$registerData = @{
    username = $testUsername
    password = $testPassword
    email    = $testEmail
    role     = "user"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerData -ErrorAction Stop
    Write-TestResult "Register User" ($registerResponse.username -eq $testUsername) $registerResponse
    $registerResponse
    Write-Host $registerResponse
} catch {
    Write-Host "Register User Failed: $($_)" -ForegroundColor Red
    exit 1
}

# Test 2: Login User
Write-Host "Logging in user..." -ForegroundColor Yellow
$loginData = @{
    username = $testUsername
    password = $testPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginData -ErrorAction Stop
    Write-TestResult "Login User" ($null -ne $loginResponse.accessToken) $loginResponse
    $accessToken = $loginResponse.accessToken
    $refreshToken = $loginResponse.refreshToken
    Write-Host $loginResponse
} catch {
    Write-Host "Login User Failed: $($_)" -ForegroundColor Red
    exit 1
}

# Test 3: Get Protected Endpoint with Token
Write-Host "Accessing protected endpoint..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $accessToken" }
    $protectedResponse = Invoke-RestMethod -Uri "$baseUrl/api/protected" `
        -Method Get `
        -Headers $headers -ErrorAction Stop
    Write-TestResult "Access Protected Endpoint" ($null -ne $protectedResponse) $protectedResponse
    Write-Host $protectedResponse
} catch {
    Write-Host "Access Protected Endpoint Failed: $($_)" -ForegroundColor Red
}

# Test 4: Refresh Token
Write-Host "Refreshing access token..." -ForegroundColor Yellow
$refreshData = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

try {
    $refreshResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/refresh" `
        -Method Post `
        -ContentType "application/json" `
        -Body $refreshData -ErrorAction Stop
    Write-TestResult "Refresh Token" ($null -ne $refreshResponse.accessToken) $refreshResponse
    $newAccessToken = $refreshResponse.accessToken
    Write-Host $refreshResponse
} catch {
    Write-Host "Refresh Token Failed: $($_)" -ForegroundColor Red
}

# Test 5: Access with New Token
Write-Host "Accessing endpoint with new token..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $newAccessToken" }
    $newTokenResponse = Invoke-RestMethod -Uri "$baseUrl/api/protected" `
        -Method Get `
        -Headers $headers -ErrorAction Stop
    Write-TestResult "Access with New Token" ($null -ne $newTokenResponse) $newTokenResponse
    Write-Host $newTokenResponse
} catch {
    Write-Host "Access with New Token Failed: $($_)" -ForegroundColor Red
}

# Test 6: Invalid Token Access (Should Fail)
Write-Host "Testing with invalid token..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer invalid_token_12345" }
    $invalidResponse = Invoke-RestMethod -Uri "$baseUrl/api/protected" `
        -Method Get `
        -Headers $headers -ErrorAction Stop
    Write-TestResult "Reject Invalid Token" $true $invalidResponse
    Write-Host $invalidResponse
} catch {
    Write-TestResult "Reject Invalid Token" $false $_
}
