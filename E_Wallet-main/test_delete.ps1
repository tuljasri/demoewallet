$loginBody = @{
    username = "testuser3"
    passkey = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:8081/auth/login" -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
$userId = $loginResponse.userId

Write-Host "Login successful. Token: $token"

# List accounts securely (the endpoint I just fixed)
$accounts = Invoke-RestMethod -Method Get -Uri "http://localhost:8081/accounts" -Headers @{ "Authorization" = "Bearer $token"; "Origin" = "http://localhost:5173" }
if ($accounts.Count -eq 0) {
    # It must have been empty. Let's add an account so we can delete it!
    $accountBody = @{
        bankName = "Delete Test Bank"
        cardNumber = "111122223333"
        accountHolder = "Me"
        balance = 50.0
    } | ConvertTo-Json

    $acc = Invoke-RestMethod -Method Post -Uri "http://localhost:8081/accounts" -Body $accountBody -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $token" }
    $accountId = $acc.id
} else {
    $accountId = $accounts[0].id
}

Write-Host "Deleting account ID: $accountId"

try {
    Invoke-RestMethod -Method Delete -Uri "http://localhost:8081/accounts/$accountId" -Headers @{ "Authorization" = "Bearer $token"; "Origin" = "http://localhost:5173" }
    Write-Host "DELETE Success!"
} catch {
    Write-Host "DELETE Fails! HTTP Status: $($_.Exception.Response.StatusCode)"
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream) {
        $reader = New-Object System.IO.StreamReader($stream)
        $reader.ReadToEnd()
    }
}
