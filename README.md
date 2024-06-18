

### Documentation

# OTP-Api

This project implements an authentication system using Express.js, Mongoose, Passport.js, and JWT. It includes local registration and login, as well as social logins with Facebook, Google, and Apple. The system also supports OTP-based email verification and password reset.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
  - [Registration](#registration)
  - [Email Verification](#email-verification)
  - [Login](#login)
  - [Password Reset](#password-reset)
  - [Social Login](#social-login)
    - [Facebook Login](#facebook-login)
    - [Google Login](#google-login)
    - [Apple Login](#apple-login)
- [Usage](#usage)

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/your-username/otp-api.git
   cd otp-api
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

## Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000

EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=your_apple_private_key

SESSION_SECRET=your_session_secret
```

Ensure all the environment variables are correctly set, especially the credentials for email and social logins.

## Running the Server

Start the server:

```sh
npm start
```

The server should be running on `http://localhost:3000`.

## API Endpoints

### Registration

- **POST /api/auth/register**
  - Registers a new user and sends an OTP to their email for verification.
  - Body parameters: `email`, `password`, `confirmPassword`
  - Example request:

    ```sh
    curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123","confirmPassword":"password123"}'
    ```

### Email Verification

- **POST /api/auth/verify**
  - Verifies the OTP sent to the user's email.
  - Body parameters: `email`, `otp`
  - Example request:

    ```sh
    curl -X POST http://localhost:3000/api/auth/verify -H "Content-Type: application/json" -d '{"email":"test@example.com","otp":"123456"}'
    ```

### Login

- **POST /api/auth/signin**
  - Authenticates a user with their email and password.
  - Body parameters: `email`, `password`
  - Example request:

    ```sh
    curl -X POST http://localhost:3000/api/auth/signin -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}'
    ```

### Password Reset

- **POST /api/auth/request-password-reset**
  - Requests an OTP for password reset.
  - Body parameters: `email`
  - Example request:

    ```sh
    curl -X POST http://localhost:3000/api/auth/request-password-reset -H "Content-Type: application/json" -d '{"email":"test@example.com"}'
    ```

- **POST /api/auth/reset-password**
  - Resets the user's password using the OTP.
  - Body parameters: `email`, `otp`, `newPassword`, `confirmNewPassword`
  - Example request:

    ```sh
    curl -X POST http://localhost:3000/api/auth/reset-password -H "Content-Type: application/json" -d '{"email":"test@example.com","otp":"123456","newPassword":"newpassword123","confirmNewPassword":"newpassword123"}'
    ```

### Social Login

#### Facebook Login

- **GET /auth/facebook**
  - Redirects the user to Facebook for authentication.

- **GET /auth/facebook/callback**
  - Facebook redirects to this endpoint after authentication.
  - Example URL:

    ```
    http://localhost:3000/auth/facebook/callback
    ```

#### Google Login

- **GET /auth/google**
  - Redirects the user to Google for authentication.

- **GET /auth/google/callback**
  - Google redirects to this endpoint after authentication.
  - Example URL:

    ```
    http://localhost:3000/auth/google/callback
    ```

#### Apple Login
## not Available now
- **GET /auth/apple**
  - Redirects the user to Apple for authentication.

- **POST /auth/apple/callback**
  - Apple redirects to this endpoint after authentication.
  - Example URL:

    ```
    http://localhost:3000/auth/apple/callback
    ```

## Usage

1. **Register a new user**: Send a POST request to `/api/auth/register` with the user's email and password. An OTP will be sent to the user's email.

2. **Verify email**: Send a POST request to `/api/auth/verify` with the email and OTP to verify the user's email address.

3. **Login**: Send a POST request to `/api/auth/signin` with the email and password to log in.

4. **Request password reset**: Send a POST request to `/api/auth/request-password-reset` with the email to receive an OTP for password reset.

5. **Reset password**: Send a POST request to `/api/auth/reset-password` with the email, OTP, and new password to reset the password.

6. **Social login**: Use the provided endpoints to log in with Facebook, Google, or Apple.

---

This documentation provides a comprehensive guide for setting up and using the OTP-Api project, including environment setup, running the server, and using the various API endpoints. Make sure to replace placeholder values in the `.env` file with actual credentials.
