


# Authentication API Documentation

## Overview

This API provides user authentication features, including registration, email verification, sign-in, and password reset using OTP.

**Base URL:** `https://auth-api-31e2.onrender.com`

## Endpoints

### 1. Register a New User

**URL:** `/api/auth/register`  
**Method:** `POST`  
**Description:** Registers a new user and sends a verification OTP to the provided email address.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**
- `201 Created` - Redirects to the OTP verification page.
- `400 Bad Request` - If passwords do not match or user already exists.
- `500 Internal Server Error` - If there is an issue sending the OTP or saving the user.

### 2. Verify User Email

**URL:** `/api/auth/verify`  
**Method:** `POST`  
**Description:** Verifies the user's email address using the OTP sent to their email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
- `200 OK` - Redirects to the sign-in page.
- `400 Bad Request` - If the OTP is invalid.
- `500 Internal Server Error` - If there is a server error.

### 3. User Sign-in

**URL:** `/api/auth/signin`  
**Method:** `POST`  
**Description:** Authenticates the user and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
- `200 OK` - Returns a JWT token.
- `400 Bad Request` - If the credentials are invalid or the email is not verified.
- `500 Internal Server Error` - If there is a server error.

### 4. Request Password Reset

**URL:** `/api/auth/request-password-reset`  
**Method:** `POST`  
**Description:** Sends an OTP to the user's email address for password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
- `200 OK` - Redirects to the reset password page.
- `400 Bad Request` - If the user does not exist.
- `500 Internal Server Error` - If there is an error sending the OTP.

### 5. Reset Password

**URL:** `/api/auth/reset-password`  
**Method:** `POST`  
**Description:** Resets the user's password using the OTP sent to their email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newpassword123",
  "confirmNewPassword": "newpassword123"
}
```

**Response:**
- `200 OK` - Password reset successfully.
- `400 Bad Request` - If the OTP is invalid or the passwords do not match.
- `500 Internal Server Error` - If there is a server error.

## Usage

### Register a New User
1. Send a `POST` request to `/api/auth/register` with the user's email, password, and password confirmation.
2. Check your email for the OTP and verify your email.

### Sign In
1. Send a `POST` request to `/api/auth/signin` with the user's email and password.
2. If successful, you will receive a JWT token.

### Forgot Password
1. Send a `POST` request to `/api/auth/request-password-reset` with the user's email.
2. Check your email for the OTP and visit the reset password page.
3. Send a `POST` request to `/api/auth/reset-password` with the user's email, OTP, new password, and password confirmation.

---

Feel free to contact us if you encounter any issues or have any questions about using the API.
