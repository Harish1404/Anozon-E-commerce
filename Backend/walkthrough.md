# OTP Flow Enhancements Walkthrough

I've successfully implemented the token-based OTP verification, cooldowns for resending OTPs, and the temporary email blocking logic. Here is a breakdown of what was accomplished and how it works:

## Changes Made

### 1. Token-Based OTP Implementation
Instead of relying on the email address in plain text during the OTP verification phase, the system now issues a unique `otp_token` whenever an OTP is generated (during signup or resend).
- The `otp_token` is mapped to the user's `email` and the actual `otp` code securely inside Redis.
- The `OTPVerifyRequest` model was updated to accept `otp_token` instead of `email`.
- The frontend is now expected to receive this `otp_token` from the backend upon a successful `POST /auth/signup` and pass it back to `POST /auth/verify-otp`.

### 2. Resend Cooldown
To prevent spam and abuse of the email service, a `RESEND_COOLDOWN` of 60 seconds was added.
- A new endpoint `POST /auth/resend-otp` was created, which accepts a `ResendOTPRequest` (containing the email).
- If a user tries to request a new OTP before the 60 seconds expire, they will receive a `400 Bad Request` with the message: `"Please wait 60 seconds before requesting a new OTP."`

### 3. Max Attempts & Temporary Block
To defend against OTP brute-forcing and email spamming, limits were placed on the number of verification attempts and resend requests.
- **Verification Limits**: Users are allowed a maximum of 5 attempts (`MAX_ATTEMPTS`). Each failed attempt increments a counter in Redis. The user is informed of how many attempts they have remaining (e.g., `"Invalid OTP. 4 attempts remaining."`).
- **Resend Limits**: Users can request to resend the OTP a maximum of 3 times (`MAX_RESEND_ATTEMPTS`) within the block timeframe.
- If either limit is reached, the `otp_token` is immediately invalidated, and the email is blocked for `BLOCKTIME` (10 minutes or 600 seconds).
- Further attempts to sign up, resend OTPs, or verify OTPs for that email during the blocked period will result in a `400` error: `"Account temporarily blocked due to too many failed attempts."`

## Verification & Usage

You can test the updated endpoints in the Swagger/OpenAPI docs:
- **`POST /auth/signup`**: Returns `{"message": "...", "otp_token": "<uuid>"}`.
- **`POST /auth/verify-otp`**: Expects `{"otp_token": "<uuid>", "otp": "123456"}`.
- **`POST /auth/resend-otp`**: Expects `{"email": "user@example.com"}` and returns a new `otp_token`.

> [!WARNING]
> Please ensure that your frontend application is updated to handle the new `otp_token` logic, as the older `email`-based verification payload will no longer work.
