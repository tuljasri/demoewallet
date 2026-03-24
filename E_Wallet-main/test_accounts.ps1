$loginBody = @{
    username = "testuser3"
    passkey = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:8081/auth/login" -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
$userId = $loginResponse.userId

Write-Host "Login successful. Token: $token, UserId: $userId"

try {
    $r = Invoke-RestMethod -Method Get -Uri "http://localhost:8081/accounts/$userId" -Headers @{ "Authorization" = "Bearer $token"; "Origin" = "http://localhost:5173" }
    Write-Host "GET Success! Response:"
    $r | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Fails! HTTP Status: $($_.Exception.Response.StatusCode)"
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream) {
        $reader = New-Object System.IO.StreamReader($stream)
        $reader.ReadToEnd()
    }
}
