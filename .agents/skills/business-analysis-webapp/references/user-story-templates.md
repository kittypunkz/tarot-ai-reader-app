# User Story Templates & Examples

This reference provides detailed examples of well-structured user stories.

## Example 1: User Authentication (Login)

### US-001: User Login with Email and Password

**As a** registered user  
**I want** to log in with my email and password  
**So that** I can access my personalized dashboard and data

#### User Journey Flow
The user navigates to the login page from the homepage, enters their credentials, submits the form, and is redirected to their dashboard upon successful authentication. If credentials are invalid, they receive clear error feedback.

#### Scenarios

**Happy Path:**
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | User clicks "Login" button on homepage | Navigate to login page | "Login" button in top navigation bar |
| 2 | User enters valid email in email field | Email format validated | Email input field with validation icon |
| 3 | User enters password in password field | Password masked with dots | Password input field with show/hide toggle |
| 4 | User clicks "Sign In" button | System validates credentials | "Sign In" button with loading spinner |
| 5 | Credentials valid | Create session, redirect to dashboard | Browser navigates to /dashboard |
| 6 | Dashboard loads | Display user's data and welcome message | Dashboard page with user name in header |

**Unhappy Case 1: Invalid Email Format**
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | User enters invalid email format | Show validation error | Email field with red border and error message below: "Please enter a valid email address" |
| 2 | User tries to submit | Prevent form submission | Sign In button disabled until valid |

**Unhappy Case 2: Incorrect Credentials**
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | User enters unregistered email or wrong password | Validate against database | Form shows generic error |
| 2 | System rejects | Display error message | Red alert banner above form: "Invalid email or password" |
| 3 | - | Log failed attempt | (internal) |
| 4 | User can retry | Clear password field only | Password field cleared, email preserved |

**Unhappy Case 3: Account Locked**
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | User enters credentials after 5 failed attempts | Check lock status | System detects locked account |
| 2 | System rejects | Show lock message | Alert: "Account temporarily locked. Please try again in 30 minutes or reset your password." |
| 3 | - | Offer password reset | "Forgot Password?" link highlighted |

**Unhappy Case 4: Session Expired**
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | User tries to access protected page with expired session | Detect invalid/expired token | Redirect to login |
| 2 | User redirected to login | Show informational message | Yellow info banner: "Your session has expired. Please log in again." |

#### Acceptance Criteria
- [ ] User can enter email and password
- [ ] Email format is validated before submission
- [ ] Password is masked by default, toggle to show
- [ ] Valid credentials create authenticated session
- [ ] Invalid credentials show generic error message (security)
- [ ] Account locks after 5 consecutive failed attempts for 30 minutes
- [ ] Session expires after 24 hours of inactivity
- [ ] Successful login redirects to originally requested page or dashboard
- [ ] Login page is responsive (mobile, tablet, desktop)

#### API Design

**Endpoint**: `POST /api/v1/auth/login`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response 200 (Success):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 86400,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user"
    }
  }
}
```

**Response 400 (Validation Error):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["Please enter a valid email address"]
    }
  }
}
```

**Response 401 (Authentication Failed):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

**Response 423 (Account Locked):**
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account temporarily locked due to too many failed attempts",
    "retry_after": 1800
  }
}
```

**Response 429 (Rate Limited):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many login attempts. Please try again later."
  }
}
```

#### Database Schema

**Table: `users`**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | User's email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| first_name | VARCHAR(100) | NOT NULL | User's first name |
| last_name | VARCHAR(100) | NOT NULL | User's last name |
| role | ENUM('user', 'admin') | DEFAULT 'user' | User role |
| email_verified | BOOLEAN | DEFAULT false | Email verification status |
| failed_login_attempts | INTEGER | DEFAULT 0 | Count of consecutive failures |
| locked_until | TIMESTAMP | NULLABLE | Account lock expiration |
| last_login_at | TIMESTAMP | NULLABLE | Last successful login |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_users_email` on `email` (unique)
- `idx_users_role` on `role`

**Table: `sessions`**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Session identifier |
| user_id | UUID | FK -> users.id, INDEX | Associated user |
| token_hash | VARCHAR(255) | NOT NULL, UNIQUE | Hashed session token |
| ip_address | VARCHAR(45) | NULLABLE | User's IP address |
| user_agent | VARCHAR(500) | NULLABLE | Browser user agent |
| expires_at | TIMESTAMP | NOT NULL | Session expiration |
| created_at | TIMESTAMP | DEFAULT NOW() | Session creation |

**Indexes:**
- `idx_sessions_user_id` on `user_id`
- `idx_sessions_expires_at` on `expires_at`

**Relationships:**
- `sessions.user_id` -> `users.id` (ON DELETE CASCADE)

#### Dependencies
- **Depends on**: None (foundational story)
- **Blocks**: US-002 (User Profile), US-003 (Password Reset), US-004 (Dashboard Access)
- **External**: Email service for future email verification

#### Security Notes
- Passwords hashed with bcrypt (cost factor 12+)
- Generic error message for failed logins (prevent user enumeration)
- Rate limiting: 5 attempts per 15 minutes per IP
- Account lockout after 5 failed attempts for 30 minutes
- Session tokens are cryptographically secure random strings
- HTTPS enforced for all authentication endpoints
- Password field never logged
- SQL injection prevented via parameterized queries
- XSS prevention through output encoding

---

## Example 2: E-commerce Product Purchase

### US-005: Add Product to Cart

**As a** shopper  
**I want** to add products to my shopping cart  
**So that** I can collect items for purchase

#### User Journey Flow
The shopper browses products, finds an item they want, selects options (size, color, quantity), and adds it to their cart. They receive immediate visual confirmation and can see the cart update in real-time.

#### Scenarios

**Happy Path:**
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | User views product details page | Load product data | Product page with image, description, price |
| 2 | User selects size "Large" from dropdown | Update available quantity | Size dropdown with options |
| 3 | User selects color "Blue" | Update product image if variant image exists | Color swatches with selection indicator |
| 4 | User changes quantity to 2 | Validate against stock | Quantity stepper input |
| 5 | User clicks "Add to Cart" button | Validate stock availability | "Add to Cart" button |
| 6 | Stock available | Add item to cart, update cart count | Button shows loading, then "Added!" confirmation |
| 7 | System updates cart | Persist to database/storage | Cart icon in header updates count badge to 2 |
| 8 | Display confirmation | Show success message | Toast notification: "2x Blue T-Shirt (L) added to cart" |

**Unhappy Case 1: Out of Stock**
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | User selects combination that's out of stock | Check inventory | Size option grayed out with "Out of Stock" label |
| 2 | OR user tries to add when stock insufficient | Validate quantity | Error toast: "Sorry, only 1 item left in stock" |
| 3 | - | Disable add button | "Add to Cart" button disabled with "Out of Stock" text |

**Unhappy Case 2: Maximum Quantity Exceeded**
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | User tries to add more than max allowed (e.g., 99) | Validate quantity limit | Quantity input capped at max |
| 2 | User clicks add | Show limit message | Inline message: "Maximum 10 items per order" |

**Unhappy Case 3: Session/Guest Cart**
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | Guest user adds to cart | Store in localStorage | Cart persists for guest |
| 2 | User logs in later | Merge guest cart with user cart | Cart shows combined items |

#### Acceptance Criteria
- [ ] User can select product variants (size, color, etc.)
- [ ] User can specify quantity (1-99)
- [ ] Stock availability checked before adding
- [ ] Cart updates immediately with visual feedback
- [ ] Cart persists across page refreshes (authenticated users)
- [ ] Guest cart persists in localStorage
- [ ] Cart merges correctly on login
- [ ] Maximum quantity limits enforced

#### API Design

**Endpoint**: `POST /api/v1/cart/items`

**Authentication**: Required OR Guest (session-based)

**Request Body:**
```json
{
  "product_id": "550e8400-e29b-41d4-a716-446655440000",
  "variant_id": "660e8400-e29b-41d4-a716-446655440001",
  "quantity": 2
}
```

**Response 200 (Item Added):**
```json
{
  "success": true,
  "data": {
    "cart_item_id": "770e8400-e29b-41d4-a716-446655440002",
    "product": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Premium T-Shirt",
      "price": 29.99,
      "image_url": "https://cdn.example.com/images/tshirt-blue.jpg"
    },
    "variant": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "size": "L",
      "color": "Blue"
    },
    "quantity": 2,
    "subtotal": 59.98,
    "cart_summary": {
      "item_count": 3,
      "total": 89.97
    }
  }
}
```

**Response 400 (Insufficient Stock):**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Only 1 item available",
    "available_quantity": 1
  }
}
```

**Response 404 (Product Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product or variant not found"
  }
}
```

#### Database Schema

**Table: `cart_items`**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Cart item ID |
| user_id | UUID | FK -> users.id, NULLABLE | Owner (null for guests) |
| session_id | VARCHAR(255) | INDEX, NULLABLE | Guest session identifier |
| product_id | UUID | FK -> products.id | Product reference |
| variant_id | UUID | FK -> product_variants.id | Selected variant |
| quantity | INTEGER | NOT NULL, CHECK > 0 | Item quantity |
| created_at | TIMESTAMP | DEFAULT NOW() | Added time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes:**
- `idx_cart_items_user_id` on `user_id`
- `idx_cart_items_session_id` on `session_id`
- `idx_cart_items_product_variant` on `product_id`, `variant_id`

**Relationships:**
- `cart_items.user_id` -> `users.id` (ON DELETE CASCADE)
- `cart_items.product_id` -> `products.id` (ON DELETE CASCADE)
- `cart_items.variant_id` -> `product_variants.id` (ON DELETE CASCADE)

#### Dependencies
- **Depends on**: US-001 (Authentication), Product Catalog implemented
- **Blocks**: US-006 (View Cart), US-007 (Checkout)
- **External**: Inventory management system

#### Security Notes
- Stock validation on server side (never trust client quantity)
- Prevent cart manipulation by validating product_id/variant_id exist
- Rate limit cart additions to prevent inventory exhaustion attacks
- Validate user can only modify their own cart
- XSS prevention on product names/descriptions in cart display

---

## Template Quick Reference

### Scenario Table Format
```markdown
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
```

### API Template
```markdown
**Endpoint**: `METHOD /path`

**Authentication**: Required/Optional

**Request:**
```json
{}
```

**Response 200:**
```json
{}
```

**Error Responses:**
- `400`: [Description]
- `401`: [Description]
```

### Database Schema Template
```markdown
**Table: `table_name`**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| ... | ... | ... | |

**Indexes:**
- `idx_name` on `field`

**Relationships:**
- `field` -> `other_table.id`
```
