# Anozon E-commerce Backend - Development Report

This document provides a comprehensive overview of the backend architecture, workflow, database structure, and the features implemented so far for the Anozon E-commerce platform.

## 🏗️ Backend Architecture & Workflow

The backend is built using **FastAPI**, following a modular **Service-Repository-Model (SRM)** design pattern to ensure scalability, maintainability, and clean separation of concerns.

### Design Pattern
- **Models**: Defines data structures using Pydantic for request validation and response serialization.
- **Services**: Contains the core business logic (e.g., calculating cart totals, processing orders, managing OTP security).
- **Repositories (Helpers)**: Manages direct interactions with MongoDB to perform CRUD operations.
- **Routes**: Defines the API endpoints and integrates with dependencies like JWT authentication and RBAC (Role-Based Access Control).

### Security & Authentication
- **JWT (JSON Web Tokens)**: Used for stateless user authentication.
- **OTP Verification (Redis)**: Implemented a robust OTP flow using Redis for high-speed token storage and verification.
- **Security Features**: 
    - **Token-Based Verification**: Issues an `otp_token` to prevent email spoofing.
    - **Cooldowns**: 60-second wait time between OTP resends.
    - **Rate Limiting & Blocking**: Users are blocked after 5 failed attempts for 10 minutes to prevent brute-force attacks.

---

## 🗄️ Database Schema (MongoDB Collections)

The system uses **MongoDB** as the primary database with the following collections:

| Collection | Description |
| :--- | :--- |
| `Users` | Stores core authentication data (email, hashed password, roles). |
| `Profiles` | Detailed user information including name, mobile, and multiple saved addresses. |
| `Sellers` | Stores seller-specific data, business details, and application status. |
| `Products` | Master collection for products, including descriptions, prices, stock, and status. |
| `Cart` | Temporary storage for user shopping carts and wishlists. |
| `Orders` | Persistent record of all orders, snapshots of addresses, and payment details. |
| `Reviews` | Product reviews and ratings left by users. |
| `AuditLogs` | Tracks sensitive operations for security auditing and tracking. |

---

## 🚀 Features Implemented So Far

### 1. Advanced Authentication System
- Secure signup and login flow.
- Token-based OTP verification with resend cooldown and anti-brute force blocking.
- Permission-based access control (Admin, Seller, User roles).

### 2. User Profile & Address Management
- User profile updates (Name, Mobile, Avatar).
- **Address Book**: CRUD operations for multiple delivery addresses with "Default" address logic.

### 3. Product Management & Discovery
- **Advanced Search**: Regex-based search across names and descriptions.
- **Category Filtering**: Ability to filter products by category.
- **Stock Tracking**: Real-time visibility of product availability.
- **Interaction**: Like/Unlike system that increments/decrements global product popularity.

### 4. Smart Shopping Cart
- **Dynamic Calculations**: Automatically computes Subtotal, GST (18%), and Delivery Charges on the fly.
- **Free Delivery Logic**: Automatic delivery charge waiver for orders above ₹500.
- **Stock Validation**: Ensures users cannot add more items than available in stock.

### 5. Robust Order Management
- **Order Placement**: Atomic operation that snapshots the current price and shipping address.
- **Inventory Control**: Automatically decrements stock on order and **restores** it if an order is cancelled.
- **Lifecycle Tracking**: Full order status tracking (Pending → Confirmed → Shipped → Delivered).
- **Cancellation**: Users can cancel orders in the `pending` state with automatic stock recovery.

### 6. Seller Activity & Operations
- **Seller Dashboard**: Provides statistics on sales, orders, and products.
- **Product Control**: Sellers can add, update, soft-delete, and toggle the active status of their products.
- **Order Slicing**: Orders are sliced per seller, allowing sellers to manage their specific items within a multi-seller order independently.

---

## 🛠️ Tech Stack
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (Motor Driver)
- **Caching/Security**: Redis
- **Validation**: Pydantic v2
- **Logging**: Integrated Uvicorn/Python logging for cloud debugging.
