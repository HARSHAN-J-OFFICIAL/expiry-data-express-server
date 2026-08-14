# History - Implement `/auth/logout` API

Implemented the `POST /auth/logout` endpoint in the Node.js/Express backend to clear the `jwtToken` HTTP-only cookie and updated the React client to trigger this endpoint during user logout.

## Changes Made

### Node.js/Express Backend (`expiry-date-express-server`)

#### `src/controllers/authController.js`
- Added `logout` function to `authController`:
  ```javascript
  logout: async (request, response) => {
      try {
          response.clearCookie('jwtToken', {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              path: '/'
          });

          return response.status(200).json({
              message: 'User logged out successfully'
          });
      } catch (error) {
          console.error('Logout error:', error);
          return response.status(500).json({
              message: 'Internal server error'
          });
      }
  }
  ```

#### `src/routes/authRoutes.js`
- Registered `POST /auth/logout` route mapping to `authController.logout`.
- Added OpenAPI/Swagger documentation block for `POST /auth/logout`.

#### `tests/auth.test.js`
- Added integration test verifying that `POST /auth/logout` clears `jwtToken` cookie (`set-cookie` header) and returns HTTP 200.

### React Frontend Client (`expiry-data-manager-react-client`)

#### `src/App.jsx`
- Updated `handleLogout` to send a `POST` request to `http://localhost:5001/auth/logout` with `credentials: 'include'` before clearing local storage.

---

## Verification Results

### Automated Tests Execution
Executed `npm test` inside `expiry-date-express-server`:

```text
PASS tests/auth.test.js (8.399 s)
  Auth APIs Integration Tests
    POST /auth/register
      √ should fail with validation error when name is missing (106 ms)
      √ should fail with validation error when password is too short (15 ms)
      √ should successfully register a new user (196 ms)
      √ should fail when registering with an existing email (18 ms)
    POST /auth/login
      √ should fail when email is not registered (16 ms)
      √ should fail with wrong password (112 ms)
      √ should successfully login with valid credentials (111 ms)
    POST /auth/logout
      √ should clear jwtToken cookie and return 200 on logout (15 ms)
    GET /api-docs
      √ should serve Swagger UI documentation (33 ms)

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        9.232 s
Ran all test suites.
```
