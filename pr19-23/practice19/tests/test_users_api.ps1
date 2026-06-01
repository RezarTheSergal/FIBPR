# Practice 19 - PostgreSQL User API Tests
param(
    [string]$baseUrl = "http://localhost:3000",
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

Write-TestHeader "Practice 19 - PostgreSQL User API Tests"

# Test 2: Create User
Write-Host "`nCreating test user..." -ForegroundColor Yellow
$newUser = @{
    username = "testuser_$(Get-Random)"
    age      = 25
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "$baseUrl/api/users" `
        -Method Post `
        -ContentType "application/json" `
        -Body $newUser -ErrorAction Stop
    Write-TestResult "Create User" ($createResponse.id -gt 0) $createResponse
    $userId = $createResponse.id
    $createResponse
} catch {
    Write-Host "Create User Failed: $($_)" -ForegroundColor Red
    exit 1
}

# Test 3: Get All Users
Write-Host "Retrieving all users..." -ForegroundColor Yellow
try {
    $allUsers = Invoke-RestMethod -Uri "$baseUrl/api/users" -Method Get -ErrorAction Stop
    Write-TestResult "Get All Users" ($allUsers.Count -gt 0) $allUsers
    $allUsers
} catch {
    Write-Host "Get All Users Failed: $($_)" -ForegroundColor Red
}

# Test 4: Get Single User
Write-Host "Retrieving specific user..." -ForegroundColor Yellow
try {
    $singleUser = Invoke-RestMethod -Uri "$baseUrl/api/users/$userId" -Method Get -ErrorAction Stop
    Write-TestResult "Get Single User" ($singleUser.id -eq $userId) $singleUser
    $singleUser
} catch {
    Write-Host "Get Single User Failed: $($_)" -ForegroundColor Red
}

# Test 5: Update User
Write-Host "Updating user..." -ForegroundColor Yellow
$updateData = @{
    age = 26
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/api/users/$userId" `
        -Method Patch `
        -ContentType "application/json" `
        -Body $updateData -ErrorAction Stop
    Write-TestResult "Update User" ($updateResponse.age -eq 26) $updateResponse
    $updateResponse
} catch {
    Write-Host "Update User Failed: $($_)" -ForegroundColor Red
}

# Test 6: Delete User
Write-Host "Deleting user..." -ForegroundColor Yellow
try {
    $deleteResponse = Invoke-RestMethod -Uri "$baseUrl/api/users/$userId" `
        -Method Delete -ErrorAction Stop
    Write-TestResult "Delete User" ($deleteResponse.message -like "*deleted*") $deleteResponse
    $deleteResponse 
} catch {
    Write-Host "Delete User Failed: $($_)" -ForegroundColor Red
}
