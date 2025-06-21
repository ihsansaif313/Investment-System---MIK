# Investor Management API Documentation

## Base URL
```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Rate Limiting
- **Investor Management**: 10 requests per 15 minutes
- **Password Operations**: 5 requests per hour

---

## Admin-Only Endpoints

### Create Investor Account
**POST** `/investor-management`

Creates a new investor account. Only accessible by admins and superadmins.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "cnic": "12345-6789012-3",
  "address": "123 Main St, City, Country",
  "dateOfBirth": "1990-01-01",
  "investmentPreferences": {
    "riskTolerance": "medium",
    "preferredSectors": ["Technology", "Healthcare"],
    "investmentGoals": ["Wealth Building", "Retirement Planning"],
    "timeHorizon": "long"
  },
  "initialInvestmentAmount": 10000,
  "notes": "VIP client"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Investor account created successfully. Welcome email sent with login instructions.",
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "cnic": "12345-6789012-3",
      "address": "123 Main St, City, Country",
      "dateOfBirth": "1990-01-01T00:00:00.000Z",
      "accountStatus": "pending_setup",
      "isFirstLogin": true,
      "created_at": "2025-06-20T12:00:00.000Z",
      "role": {
        "id": "60f7b3b3b3b3b3b3b3b3b3b4",
        "type": "investor",
        "status": "active"
      }
    }
  }
}
```

**Error Responses:**
- `400` - Validation failed
- `401` - Authentication required
- `403` - Access denied (not admin/superadmin)
- `409` - Email or CNIC already exists

---

### Get Investor Details
**GET** `/investor-management/:id`

Retrieves detailed information about a specific investor.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "cnic": "12345-6789012-3",
    "address": "123 Main St, City, Country",
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "accountStatus": "active",
    "isFirstLogin": false,
    "investmentPreferences": {
      "riskTolerance": "medium",
      "preferredSectors": ["Technology", "Healthcare"],
      "investmentGoals": ["Wealth Building", "Retirement Planning"],
      "timeHorizon": "long"
    },
    "initialInvestmentAmount": 10000,
    "createdBy": "60f7b3b3b3b3b3b3b3b3b3b1",
    "created_at": "2025-06-20T12:00:00.000Z",
    "role": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "type": "investor",
      "status": "active"
    }
  }
}
```

**Error Responses:**
- `400` - Invalid investor ID format
- `401` - Authentication required
- `403` - Access denied
- `404` - Investor not found

---

### List Company Investors
**GET** `/investor-management/company/:companyId`

Retrieves all investors for a specific company. Admins can only access investors for companies they're assigned to.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "accountStatus": "active",
      "isFirstLogin": false,
      "created_at": "2025-06-20T12:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401` - Authentication required
- `403` - Access denied to this company
- `500` - Server error

---

## Public Endpoints (Investor Authentication)

### First-Time Password Setup
**POST** `/investor-auth/setup-password`

Allows investors to set up their password on first login using the temporary password.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "currentPassword": "TempPass123!",
  "newPassword": "MySecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password setup completed successfully. You can now use your new password to log in."
}
```

**Error Responses:**
- `400` - Validation failed or password already set up
- `401` - Current password incorrect
- `403` - Not an investor account
- `404` - User not found

---

### Forgot Password
**POST** `/investor-auth/forgot-password`

Initiates password reset process for investors.

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If an account with this email exists, a password reset link has been sent."
}
```

**Note:** Always returns success for security (doesn't reveal if email exists).

---

### Reset Password
**POST** `/investor-auth/reset-password`

Resets investor password using the token from email.

**Request Body:**
```json
{
  "token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
  "newPassword": "MyNewSecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now log in with your new password."
}
```

**Error Responses:**
- `400` - Invalid/expired token or validation failed
- `403` - Access denied
- `500` - Server error

---

## Development Endpoints

### Debug User Structure
**GET** `/investor-management/debug-user`

Returns current user structure for debugging. Only available in development.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b1",
    "email": "admin@example.com",
    "role": {
      "id": "superadmin",
      "name": "superadmin",
      "permissions": ["..."],
      "status": "active"
    }
  }
}
```

---

### Test Email Configuration
**GET** `/investor-management/test-email`

Tests email configuration. Only available in development.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email configuration is valid"
}
```

---

## Error Codes

### Standard HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation failed)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (access denied)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Custom Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

## Data Models

### Investor Creation Request
```typescript
interface CreateInvestorForm {
  firstName: string;           // Required
  lastName: string;            // Required
  email: string;              // Required, unique
  phone: string;              // Required
  cnic: string;               // Required, unique
  address: string;            // Required
  dateOfBirth: string;        // Required, ISO date
  investmentPreferences?: {
    riskTolerance?: 'low' | 'medium' | 'high';
    preferredSectors?: string[];
    investmentGoals?: string[];
    timeHorizon?: 'short' | 'medium' | 'long';
  };
  initialInvestmentAmount?: number;
  notes?: string;
}
```

### User Response
```typescript
interface UserWithRole {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  cnic?: string;
  address?: string;
  dateOfBirth?: Date;
  accountStatus?: 'pending_setup' | 'active' | 'suspended' | 'inactive';
  isFirstLogin?: boolean;
  investmentPreferences?: InvestmentPreferences;
  initialInvestmentAmount?: number;
  createdBy?: string;
  created_at: Date;
  role: {
    id: string;
    type: string;
    status: string;
  };
}
```

---

## Rate Limiting Details

### Investor Management Endpoints
- **Window**: 15 minutes
- **Limit**: 10 requests per IP
- **Applies to**: All `/investor-management` routes

### Password Endpoints
- **Window**: 1 hour
- **Limit**: 5 requests per IP
- **Applies to**: `/investor-auth/setup-password`, `/investor-auth/forgot-password`, `/investor-auth/reset-password`

### Rate Limit Headers
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1640995200
```

---

## Security Considerations

1. **Authentication**: All admin endpoints require valid JWT token
2. **Authorization**: Role-based access control enforced
3. **Input Validation**: All inputs validated and sanitized
4. **Rate Limiting**: Prevents abuse and brute force attacks
5. **Password Security**: Strong password requirements enforced
6. **Email Security**: Reset flows don't reveal user existence
7. **Token Security**: Password reset tokens expire in 1 hour
8. **Audit Logging**: All operations logged for compliance

---

*Last Updated: June 20, 2025*
