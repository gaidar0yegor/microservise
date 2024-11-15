# API Documentation

## Authentication

### Login
- **URL**: `/api/auth/login/`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

### Logout
- **URL**: `/api/auth/logout/`
- **Method**: `POST`

## Stock Management

### List Products
- **URL**: `/api/products/`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Page number
  - `search`: Search term
  - `category`: Filter by category

### Create Product
- **URL**: `/api/products/`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "sku": "string",
    "price": "decimal",
    "quantity": "integer",
    "category": "integer"
  }
  ```

### Update Stock
- **URL**: `/api/stock/adjust/`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "product_id": "integer",
    "quantity": "integer",
    "type": "string" // "add" or "remove"
  }
  ```

### Stock Movement History
- **URL**: `/api/stock/movements/`
- **Method**: `GET`
- **Query Parameters**:
  - `product`: Filter by product ID
  - `start_date`: Filter from date
  - `end_date`: Filter to date

## Suppliers

### List Suppliers
- **URL**: `/api/suppliers/`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Page number
  - `search`: Search term

### Create Supplier
- **URL**: `/api/suppliers/`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "string",
    "contact_person": "string",
    "email": "string",
    "phone": "string",
    "address": "string"
  }
  ```

## Reports

### Stock Level Report
- **URL**: `/api/reports/stock-levels/`
- **Method**: `GET`
- **Query Parameters**:
  - `below_threshold`: Filter items below threshold
  - `category`: Filter by category

### Movement Report
- **URL**: `/api/reports/movements/`
- **Method**: `GET`
- **Query Parameters**:
  - `start_date`: Start date
  - `end_date`: End date
  - `product`: Filter by product ID

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "string",
  "details": {}
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

## Pagination

List endpoints return paginated results in this format:
```json
{
  "count": "integer",
  "next": "string (url)",
  "previous": "string (url)",
  "results": []
}
