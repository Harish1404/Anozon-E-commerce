# FastAPI Product Shop

A full-stack e-commerce application built with **FastAPI** backend and **React+Vite** frontend. Browse products, manage your cart, and authenticate securely.

---

## 🚀 Features

- **User Authentication** - Secure login and registration system
- **Product Catalog** - Browse and view detailed product information
- **Shopping Cart** - Add/remove products and manage quantities
- **Dark Mode** - Toggle between light and dark themes
- **Email Notifications** - Background email sending for orders
- **MongoDB Database** - Persistent data storage
- **RESTful API** - Clean and organized API endpoints

---

## 💻 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database
- **Python-jose** - JWT authentication
- **Pydantic** - Data validation

### Frontend
- **React 18** - UI library
- **Vite** - Fast build tool and dev server
- **JavaScript** - Client-side logic
- **CSS** - Styling

---

## 📁 Project Structure

```
Fastapi Project/
├── Backend/                  # FastAPI application
│   ├── app/
│   │   ├── main.py          # Application entry point
│   │   ├── core/            # Config & security settings
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── db/              # Database connection
│   │   ├── deps/            # Dependencies (auth)
│   │   └── utils/           # Utilities
│   ├── server.py            # Server launcher
│   └── requirements.txt      # Python dependencies
│
├── Frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Context API (Cart)
│   │   ├── services/        # API calls
│   │   └── main.jsx         # App entry point
│   ├── package.json         # Node dependencies
│   └── vite.config.js       # Vite configuration
```

---

## 🛠️ Installation

### Prerequisites
- Python 3.8+
- Node.js 14+
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd Backend
```

2. Create a virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables in `app/core/config.py`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

---

## ▶️ Running the Application

### Start Backend Server

```bash
cd Backend
python server.py
```
Backend runs on: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### Start Frontend Development Server

```bash
cd Frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 📚 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

### Products
- `GET /products` - Get all products
- `GET /products/{id}` - Get product details
- `POST /products` - Create product (admin)
- `PUT /products/{id}` - Update product (admin)
- `DELETE /products/{id}` - Delete product (admin)

### Protected Routes
- `GET /protected` - Protected endpoint (requires auth)

### Email
- `POST /email/send` - Send email notification

---

## 🎨 Features Overview

### Shopping Cart
- Add/remove products from cart
- Persistent cart state using React Context
- Real-time cart updates

### User Authentication
- Secure JWT-based authentication
- Protected API endpoints
- User session management

### Product Management
- View all available products
- Detailed product information
- Admin controls for CRUD operations

### Email System
- Background task for sending emails
- Order confirmation notifications

---

## 📝 Configuration

### Backend Configuration
Edit `Backend/app/core/config.py` for:
- Database connection string
- JWT secret key
- Email settings
- API settings

### Frontend Configuration
Edit `Frontend/vite.config.js` for:
- API proxy settings
- Build options
- Dev server settings

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📝 License

This project is open source and available under the MIT License.

---

## 📧 Support

For questions or issues, please open an issue in the repository.

---

**Happy shopping! 🛍️**
