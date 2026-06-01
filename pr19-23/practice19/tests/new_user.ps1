# Подготовка тела запроса как JSON
$body = @{
    username = "john_doe"
    email    = "john@example.com"
    age      = 30
} | ConvertTo-Json

# Отправка POST-запроса
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/users" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

# Вывод ответа
$response