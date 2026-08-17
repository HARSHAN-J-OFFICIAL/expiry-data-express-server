# Implementation Tasks - API Creation

## Task List

### 1. Database Model & DAO Layer
- [x] Create Product model (`src/models/product.js`) with schema for `title`, `upcCode`, `amount`, `expiryDate`, `category`, `location`, `status`, and `userId`.
- [x] Create Product DAO (`src/dao/productDao.js`) with `create`, `findByIdAndUser`, `updateByIdAndUser`, `deleteByIdAndUser`, and `findPaginated` methods.

### 2. Validation & Authentication Middleware
- [x] Implement Auth Middleware (`src/middleware/authMiddleware.js`) to secure product endpoints via JWT.
- [x] Create Product Validators (`src/utils/productValidators.js`) using `express-validator`.

### 3. Controller & Routes
- [x] Create Product Controller (`src/controllers/productController.js`) handling pagination (max 20 items/page), search (title & UPC code), and expiry date range filtering (`1month`, `3months`, `6months`, `expired`, `all`).
- [x] Create Product Routes (`src/routes/productRoutes.js`) mapping to controller methods with Swagger OpenAPI annotations.
- [x] Mount `/products` in `server.js`.

### 4. Testing & Documentation
- [x] Create integration tests (`tests/product.test.js`) verifying CRUD, pagination, search, and date filters.
- [x] Serve Swagger UI documentation at `/api-docs`.

---

## REST API Signatures

### 1. Fetch Paginated Products (Dashboard, Search & Filters)
- **Method**: `GET`
- **Endpoint**: `/products`
- **Headers**: `Cookie: jwtToken=<token>` or `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (integer, default: `1`)
  - `limit` (integer, default: `20`, max: `20`)
  - `search` (string, optional - matches `title` or `upcCode`)
  - `expiryFilter` (enum: `all`, `1month`, `3months`, `6months`, `expired`, default: `all`)
- **Response `200 OK`**:
  ```json
  {
    "message": "Products retrieved successfully",
    "data": [
      {
        "_id": "66bc1234a5b6c7d8e9f01234",
        "userId": "66bc0000a5b6c7d8e9f00000",
        "title": "Organic Milk 1L",
        "upcCode": "073210001234",
        "amount": "1 bottle",
        "expiryDate": "2026-09-01T00:00:00.000Z",
        "category": "Dairy",
        "location": "Fridge",
        "status": "active"
      }
    ],
    "pagination": {
      "totalItems": 45,
      "totalPages": 3,
      "currentPage": 1,
      "pageSize": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
  ```

### 2. Get Product By ID
- **Method**: `GET`
- **Endpoint**: `/products/:id`
- **Response `200 OK`**:
  ```json
  {
    "message": "Product retrieved successfully",
    "product": { ... }
  }
  ```

### 3. Add Product (Scan or Manual Entry)
- **Method**: `POST`
- **Endpoint**: `/products`
- **Body**:
  ```json
  {
    "title": "Organic Milk 1L",
    "upcCode": "073210001234",
    "amount": "1 bottle",
    "expiryDate": "2026-09-01",
    "category": "Dairy",
    "location": "Fridge"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "message": "Product created successfully",
    "product": { ... }
  }
  ```

### 4. Edit Product
- **Method**: `PUT`
- **Endpoint**: `/products/:id`
- **Body**:
  ```json
  {
    "title": "Organic Whole Milk 2L",
    "amount": "2 bottles",
    "expiryDate": "2026-09-05"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "Product updated successfully",
    "product": { ... }
  }
  ```

### 5. Delete Product
- **Method**: `DELETE`
- **Endpoint**: `/products/:id`
- **Response `200 OK`**:
  ```json
  {
    "message": "Product deleted successfully",
    "product": { ... }
  }
  ```
