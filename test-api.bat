@echo off
REM Stock Management API - Windows Batch Test Commands
REM Make sure your server is running on http://localhost:3000

set BASE_URL=http://localhost:3000

echo === STOCK MANAGEMENT API TESTS ===
echo.

echo 1. Creating a new user...
curl -X POST "%BASE_URL%/users" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"John Doe\", \"email\": \"john@example.com\", \"password\": \"password123\", \"role\": \"user\"}"
echo.

echo 2. Creating an admin user...
curl -X POST "%BASE_URL%/users" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"Jane Smith\", \"email\": \"jane@example.com\", \"password\": \"admin123\", \"role\": \"admin\"}"
echo.

echo 3. Getting all users...
curl -X GET "%BASE_URL%/users"
echo.

echo 4. Creating a stock - Apple...
curl -X POST "%BASE_URL%/stocks" ^
  -H "Content-Type: application/json" ^
  -d "{\"symbol\": \"AAPL\", \"name\": \"Apple Inc.\", \"price\": 150.00, \"quantity\": 100, \"description\": \"Technology stock\", \"category\": \"Technology\"}"
echo.

echo 5. Creating a stock - Google...
curl -X POST "%BASE_URL%/stocks" ^
  -H "Content-Type: application/json" ^
  -d "{\"symbol\": \"GOOGL\", \"name\": \"Alphabet Inc.\", \"price\": 2800.00, \"quantity\": 50, \"description\": \"Search engine and cloud services\", \"category\": \"Technology\"}"
echo.

echo 6. Creating a stock - Tesla...
curl -X POST "%BASE_URL%/stocks" ^
  -H "Content-Type: application/json" ^
  -d "{\"symbol\": \"TSLA\", \"name\": \"Tesla Inc.\", \"price\": 250.00, \"quantity\": 75, \"description\": \"Electric vehicles and energy\", \"category\": \"Automotive\"}"
echo.

echo 7. Getting all stocks...
curl -X GET "%BASE_URL%/stocks"
echo.

echo === Tests completed ===
echo.
echo To update or delete items, copy the IDs from the responses above and use:
echo curl -X PATCH "%BASE_URL%/stocks/STOCK_ID" -H "Content-Type: application/json" -d "{\"price\": 155.00}"
echo curl -X DELETE "%BASE_URL%/stocks/STOCK_ID"
echo curl -X PATCH "%BASE_URL%/users/USER_ID" -H "Content-Type: application/json" -d "{\"name\": \"Updated Name\"}"
echo curl -X DELETE "%BASE_URL%/users/USER_ID"
pause