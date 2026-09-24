# Authentication & Product CRUD Platform

A full-stack REST API and interactive frontend built with Node.js, Express, MongoDB, and React. This project demonstrates secure JWT authentication using short-lived Access Tokens and long-lived Refresh Tokens stored in `httpOnly` cookies, complete Product CRUD operations, robust field-level validation with `express-validator`, and seamless token rotation.

---

## Architecture & Features

### 1. Authentication (JWT Access + Refresh Tokens)
- **Registration**: Accepts `name`, `email`, `password`, and `confirmPassword`. Validates inputs, hashes passwords with `bcryptjs` (10 salt rounds), rejects duplicate emails with `409 Conflict`, and returns the created user without tokens or passwords.
- **Login**: Verifies credentials securely (returns generic `401 Unauthorized` on mismatch without exposing field details). Issues:
  - **Access Token**: Short-lived (15 mins), signed with `ACCESS_TOKEN_SECRET`, delivered in JSON response body.
  - **Refresh Token**: Long-lived (7 days), signed with `REFRESH_TOKEN_SECRET`, set as a secure `httpOnly` cookie and persisted in the database against the user record.
- **Refresh Flow**: `/api/auth/refresh-token` reads the cookie, verifies token validity and database persistence, and issues a brand-new access token (with optional rotation).
- **Logout**: `/api/auth/logout` invalidates the stored refresh token in the database and clears the client cookie.
- **Me**: `GET /api/auth/me` retrieves the authenticated user's profile.

### 2. Product CRUD APIs
- **Create**: `POST /api/products` (Protected) — Creates a product linked to `req.user._id`.
- **Read All**: `GET /api/products` (Public) — Lists products with optional search, category filters, and pagination.
- **Read One**: `GET /api/products/:id` (Public) — Retrieves a single product by verified MongoDB ObjectId.
- **Update**: `PUT /api/products/:id` (Protected) — Verifies product existence (404) and owner authorization before updating.
- **Delete**: `DELETE /api/products/:id` (Protected) — Confirms resource existence before deletion.

### 3. Request Validation (`express-validator`)
- Input validation runs before reaching controllers.
- Invalid requests return a structured `400 Bad Request` with field-level errors:
  ```json
  {
    "success": false,
    "message": "Validation failed. Please check the submitted fields.",
    "errors": [
      { "field": "email", "message": "Please enter a valid email address" },
      { "field": "confirmPassword", "message": "Passwords do not match" }
    ]
  }
  ```

### 4. Frontend Client
- Built with React (Vite).
- Axios client configured with `withCredentials: true` and interceptors: automatically intercepts expired access token responses (`401`), refreshes the token via `/api/auth/refresh-token`, and seamlessly replays the failed request.
- Interactive UI for registration, login, product browsing, searching, category filtering, product creation, editing, and deletion.

---

## Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection setup
│   │   ├── controllers/
│   │   │   ├── authController.js   # Register, Login, Refresh, Logout, Me
│   │   │   └── productController.js# Product CRUD handlers
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js   # Bearer JWT verification
│   │   │   └── validateMiddleware.js # express-validator error catcher
│   │   ├── models/
│   │   │   ├── Product.js          # Product schema
│   │   │   └── User.js             # User schema with bcrypt hooks
│   │   ├── routes/
│   │   │   ├── authRoutes.js       # Auth endpoints
│   │   │   └── productRoutes.js    # Product endpoints
│   │   ├── utils/
│   │   │   └── generateTokens.js   # JWT generation helpers
│   │   ├── app.js                  # Express app configuration
│   │   └── server.js               # Server entry point
│   ├── .env.example
│   ├── package.json
│   └── test-api.js                 # Automated API test suite
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js            # Axios instance with refresh interceptor
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # App navigation & user profile
│   │   │   ├── ProductModal.jsx    # Add/Edit product form modal
│   │   │   └── DeleteModal.jsx     # Delete confirmation dialog
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Authentication context & state
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Sign in view
│   │   │   ├── Register.jsx        # Sign up view
│   │   │   └── Products.jsx        # Products directory & filters
│   │   ├── App.jsx
│   │   ├── index.css               # Clean modern styling
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally on `mongodb://127.0.0.1:27017`

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (or copy from `.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/sheryians_auth_crud
ACCESS_TOKEN_SECRET=dev_jwt_access_secret_key_8712398472938472
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_SECRET=dev_jwt_refresh_secret_key_1928374650192834
REFRESH_TOKEN_EXPIRE=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend server:

```bash
# Production mode
npm start

# Development mode (with live reload)
npm run dev
```

Run automated backend tests:

```bash
npm test
```

### 2. Frontend Setup

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## API Documentation

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user, issue access token + refresh cookie |
| `POST` | `/api/auth/refresh-token` | Public* | Issue new access token using httpOnly refresh token cookie |
| `POST` | `/api/auth/logout` | Authenticated | Revoke refresh token and clear cookie |
| `GET` | `/api/auth/me` | Authenticated | Return currently logged-in user profile |

#### Register Payload (`POST /api/auth/register`)
```json
{
  "name": "Alex Mercer",
  "email": "alex@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

#### Login Payload (`POST /api/auth/login`)
```json
{
  "email": "alex@example.com",
  "password": "Password123!"
}
```

---

### Product Endpoints (`/api/products`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/products` | Authenticated | Create a new product |
| `GET` | `/api/products` | Public | List products (supports query params `search`, `category`, `page`, `limit`, `sort`) |
| `GET` | `/api/products/:id` | Public | Get single product by ID |
| `PUT` | `/api/products/:id` | Authenticated | Update a product (restricted to creator) |
| `DELETE` | `/api/products/:id` | Authenticated | Delete a product (restricted to creator) |

#### Create / Update Product Payload (`POST /api/products`)
```json
{
  "name": "Wireless Noise-Canceling Headphones",
  "description": "High-fidelity audio with 40-hour battery life and fast charging.",
  "price": 199.99,
  "category": "Electronics",
  "stock": 25
}
```

---

## Security Best Practices Implemented
- Passwords hashed with `bcryptjs` (salt rounds: 10) before storage.
- Passwords and refresh tokens automatically excluded from serialized JSON responses.
- Short-lived Access Tokens (15 min) kept in memory / client request header.
- Refresh Tokens stored in secure `httpOnly` cookies, preventing XSS token theft.
- Refresh Tokens persisted in database allowing instant server-side revocation on logout.
- Generic 401 error responses on failed login to prevent username enumeration.
- Strict input validation with `express-validator` to reject malformed or malicious payloads.
