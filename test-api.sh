#!/bin/bash
# Stock Management API - cURL Test Commands
# Make sure your server is running on http://localhost:3000

BASE_URL="http://localhost:3000"

echo "=== STOCK MANAGEMENT API TESTS ==="
echo ""

echo "1. Creating a new user..."
curl -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
echo -e "\n"

echo "2. Creating an admin user..."
curl -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "admin123",
    "role": "admin"
  }'
echo -e "\n"

echo "3. Getting all users..."
curl -X GET "$BASE_URL/users"
echo -e "\n"

echo "4. Creating a stock - Apple..."
curl -X POST "$BASE_URL/stocks" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "price": 150.00,
    "quantity": 100,
    "description": "Technology stock",
    "category": "Technology"
  }'
echo -e "\n"

echo "5. Creating a stock - Google..."
curl -X POST "$BASE_URL/stocks" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "GOOGL",
    "name": "Alphabet Inc.",
    "price": 2800.00,
    "quantity": 50,
    "description": "Search engine and cloud services",
    "category": "Technology"
  }'
echo -e "\n"

echo "6. Creating a stock - Tesla..."
curl -X POST "$BASE_URL/stocks" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "TSLA",
    "name": "Tesla Inc.",
    "price": 250.00,
    "quantity": 75,
    "description": "Electric vehicles and energy",
    "category": "Automotive"
  }'
echo -e "\n"

echo "7. Getting all stocks..."
curl -X GET "$BASE_URL/stocks"
echo -e "\n"

echo "=== Tests completed ==="
echo ""
echo "To update or delete items, copy the IDs from the responses above and use:"
echo "curl -X PATCH \"$BASE_URL/stocks/STOCK_ID\" -H \"Content-Type: application/json\" -d '{\"price\": 155.00}'"
echo "curl -X DELETE \"$BASE_URL/stocks/STOCK_ID\""
echo "curl -X PATCH \"$BASE_URL/users/USER_ID\" -H \"Content-Type: application/json\" -d '{\"name\": \"Updated Name\"}'"
echo "curl -X DELETE \"$BASE_URL/users/USER_ID\""