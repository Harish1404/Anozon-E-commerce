# Anozon E-Commerce Platform

A modern, production-ready full-stack e-commerce application built with **FastAPI** backend, **React 18** frontend, and **Docker** containerization. Complete with user authentication, product management, shopping cart, and admin dashboard.

**Live Demo:** http://localhost:3000 (after Docker setup)  
**API Docs:** http://localhost:8000/docs (Swagger UI)

---

## 🚀 Key Features

### Core E-Commerce Features
- **👤 User Authentication** - Secure JWT-based login/registration with refresh tokens
- **🛍️ Product Management** - Browse, search, filter products with detailed information
- **🛒 Shopping Cart** - Full cart management with persistent storage
- **❤️ Favorites System** - Save products to personal favorites list
- **🌙 Dark Mode** - Toggle between light and dark themes
- **🔐 Admin Dashboard** - Manage products, users, and inventory (protected routes)

### Technical Features

- **🗄️ MongoDB Database** - Scalable NoSQL database with proper indexing
- **🔒 JWT Authentication** - Secure token-based authentication with expiration
- **📱 Responsive Design** - Mobile-first UI with Tailwind CSS
- **🐳 Docker Containerization** - Complete Docker & Docker Compose setup
- **⚙️ CI/CD Pipeline** - GitHub Actions for automated testing and deployment
- **🚀 Production Ready** - Security headers, CORS configuration, error handling

---

## 💻 Tech Stack

### Backend
- **FastAPI** - Modern, fast Python web framework
- **MongoDB** - Scalable NoSQL database
- **Python 3.11** - Latest stable Python version
- **Python-jose** - JWT token generation and verification
- **Pydantic** - Data validation and serialization


### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Ultra-fast build tool and dev server
- **Node.js 18** - JavaScript runtime
- **Tailwind CSS** - Utility-first CSS framework
- **axios** - HTTP client
- **react-router-dom v6** - Client-side routing
- **Context API** - State management (Auth, Cart, Favorites)

### DevOps & Infrastructure
- **Docker** - Container platform (Python 3.11-slim, Node 18-alpine, MongoDB 7.0)
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD automation
- **Git** - Version control
- **Nginx** - Web server and reverse proxy (in frontend container)
- **GHCR** - GitHub Container Registry for image storage

---

## 📁 Project Structure

```
Anozon-E-commerce/
│
├── Backend/                           # FastAPI Application
│   ├── app/
│   │   ├── main.py                   # FastAPI app initialization
│   │   ├── core/
│   │   │   ├── config.py             # Environment variables & settings
│   │   │   ├── security.py           # JWT and password utilities
│   │   │   ├── logger.py             # Logging configuration
│   │   │   └── time_utils.py         # Time handling utilities
│   │   ├── db/
│   │   │   └── mongodb.py            # MongoDB connection & client
│   │   ├── models/
│   │   │   ├── user_model.py         # User database schema
│   │   │   ├── product_model.py      # Product database schema
│   │   │   └── email_model.py        # Email request schema
│   │   ├── routes/
│   │   │   ├── auth_user.py          # Authentication endpoints
│   │   │   ├── user_routes.py        # User profile endpoints
│   │   │   ├── product_routes.py     # Product endpoints
│   │   │   ├── admin_routes.py       # Admin-only endpoints
│   │   │   ├── protected.py          # Protected endpoints
│   │   │   └── bacground_email.py    # Email background tasks
│   │   ├── services/
│   │   │   ├── user_service.py       # User business logic
│   │   │   ├── product_service.py    # Product business logic
│   │   │   └── inventory_service.py  # Inventory management
│   │   ├── deps/
│   │   │   └── auth.py               # Dependency injection (auth)
│   │   └── utils/
│   │       └── email_sender.py       # Email sending utility
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_main.py              # Unit tests
│   │
│   ├── server.py                     # Server entry point
│   ├── requirements.txt               # Python dependencies
│   ├── dockerfile                     # Docker image definition
│   └── .env.example                   # Environment template
│
├── Frontend/                          # React + Vite Application
│   ├── src/
│   │   ├── main.jsx                  # React entry point
│   │   ├── App.jsx                   # Main App component
│   │   ├── App.css                   # Global styles
│   │   ├── index.css                 # CSS variables and base styles
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Navigation bar
│   │   │   ├── NavComp.jsx           # Navigation component
│   │   │   ├── Footer.jsx            # Footer component
│   │   │   ├── ProductCard.jsx       # Product display card
│   │   │   ├── SearchBar.jsx         # Search functionality
│   │   │   ├── DarkMode.jsx          # Dark mode toggle
│   │   │   ├── AddToCartButton.jsx   # Cart button
│   │   │   ├── ContinueShopping.jsx  # Shopping navigation
│   │   │   └── Favouites.jsx         # Favorites component
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Auth state management
│   │   │   ├── CartContext.jsx       # Cart state management
│   │   │   └── FavoritesContext.jsx  # Favorites state management
│   │   │
│   │   ├── pages/
│   │   │   ├── ProductList.jsx       # Products listing page
│   │   │   ├── ProductDetails.jsx    # Product detail page
│   │   │   ├── Cart.jsx              # Shopping cart page
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── Signup.jsx            # Registration page
│   │   │   ├── AdminDashboard.jsx    # Admin management page
│   │   │   └── Girls.jsx             # Product category page
│   │   │
│   │   ├── services/
│   │   │   ├── auth.js               # Authentication API calls
│   │   │   ├── products.js           # Product API calls
│   │   │   ├── cart.js               # Cart API calls
│   │   │   ├── favorites.js          # Favorites API calls
│   │   │   ├── Navbar.js             # Navbar API calls
│   │   │   └── Girls.js              # Category API calls
│   │   │
│   │   └── assets/
│   │       └── [images, icons, etc]
│   │
│   ├── public/                        # Static public assets
│   ├── index.html                     # HTML entry point
│   ├── vite.config.js                 # Vite configuration
│   ├── eslint.config.js               # ESLint rules
│   ├── package.json                   # Node dependencies
│   ├── dockerfile                     # Docker image definition
│   ├── nginx.conf                     # Nginx web server config
│   └── ENV_VARIABLES.md               # Frontend env var guide
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml                  # GitHub Actions pipeline
│
├── docker-compose.yml                 # Multi-container orchestration
├── DOCKER.md                          # Docker setup guide
├── DOCKER_QUICK_REFERENCE.md          # Docker cheat sheet
├── DOCKER_COMPLETE_SETUP_GUIDE.md     # Docker tutorial
├── DOCKER_SETUP_GUIDE_INDEX.md        # Docker navigation guide
├── setup-docker.ps1                   # Windows automation script
├── Readme.md                          # This file
└── .gitignore                         # Git ignore rules
```

---

## 🎯 Quick Start (5 minutes)

### Prerequisites
- **Docker** and **Docker Compose** installed
- **Git** for cloning the repository
- **Windows PowerShell** or terminal with bash/zsh

### Option 1: Automated Setup (Recommended)
```powershell
# Windows PowerShell
cd c:\path\to\Anozon-E-commerce
.\setup-docker.ps1
```

Or on macOS/Linux:
```bash
# Extract JWT_SECRET generation logic and run docker-compose
docker-compose build
docker-compose up -d
```

### Option 2: Manual Setup
```bash
# Build containers
docker-compose build

# Start containers
docker-compose up -d

# Verify all services are running
docker-compose ps

# Check logs if needed
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Access the Application
- **Frontend:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs (Swagger UI)
- **API Redoc:** http://localhost:8000/redoc (ReDoc UI)
- **MongoDB:** mongodb://localhost:27017 (internal, not exposed)

---

## 🔧 Setup Instructions (Detailed)

### 1. System Requirements

**Minimum:**
- 4GB RAM
- 2GB free disk space
- Docker 20.10+
- Docker Compose 2.0+

**Recommended:**
- 8GB+ RAM
- 5GB free disk space
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)

### 2. Environment Configuration

Create a `.env` file in the project root:
```env
# MongoDB
MONGO_URL=mongodb://mongo:27017
DB_NAME=product_shop

# JWT Configuration
JWT_SECRET=your-secure-random-secret-here-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# Email (Optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password
```

**Note:** Use `setup-docker.ps1` which auto-generates a secure JWT_SECRET.

### 3. Installation Steps

#### Clone the Repository
```bash
git clone https://github.com/yourusername/Anozon-E-commerce.git
cd Anozon-E-commerce
```

#### Build Docker Images
```bash
# Build all services (backend, frontend, mongodb)
docker-compose build

# Or build a specific service
docker-compose build backend
docker-compose build frontend
```

#### Start Services
```bash
# Start in detached mode (background)
docker-compose up -d

# Or start with logs visible
docker-compose up

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

#### Verify Setup
```bash
# Check container status
docker-compose ps

# View logs
docker logs product-shop-backend
docker logs product-shop-frontend
docker logs mongo

# Test API endpoint
curl http://localhost:8000/health
```

---

## 📚 API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password",
  "full_name": "John Doe"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=secure-password
```

**Response:**
```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "user": { "id": "...", "email": "...", "full_name": "..." }
}
```

#### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer {access_token}
```

### Product Endpoints

#### Get All Products
```http
GET /products
```

**Optional Query Parameters:**
```
?skip=0&limit=10
?category=electronics
?search=laptop
?sort=price&order=asc
```

#### Get Product by ID
```http
GET /products/{product_id}
```

#### Get Product Categories
```http
GET /products/categories
```

### User Endpoints

#### Get Current User
```http
GET /users/me
Authorization: Bearer {access_token}
```

#### Update Profile
```http
PUT /users/me
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "full_name": "John Smith",
  "phone": "+1234567890"
}
```

### Cart Endpoints

#### Add to Cart
```http
POST /cart/add
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "product_id": "...",
  "quantity": 1
}
```

#### Get Cart
```http
GET /cart
Authorization: Bearer {access_token}
```

#### Remove from Cart
```http
DELETE /cart/{product_id}
Authorization: Bearer {access_token}
```

#### Clear Cart
```http
DELETE /cart
Authorization: Bearer {access_token}
```

### Favorites Endpoints

#### Add to Favorites
```http
POST /favorites/add
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "product_id": "..."
}
```

#### Get Favorites
```http
GET /favorites
Authorization: Bearer {access_token}
```

#### Remove from Favorites
```http
DELETE /favorites/{product_id}
Authorization: Bearer {access_token}
```

### Admin Endpoints

#### Add Product (Admin Only)
```http
POST /admin/products
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Product Name",
  "description": "...",
  "price": 99.99,
  "category": "electronics",
  "stock": 10
}
```

#### Update Product (Admin Only)
```http
PUT /admin/products/{product_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 89.99,
  "stock": 15
}
```

#### Delete Product (Admin Only)
```http
DELETE /admin/products/{product_id}
Authorization: Bearer {access_token}
```

#### Get All Users (Admin Only)
```http
GET /admin/users
Authorization: Bearer {access_token}
```

---

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens** - Secure token-based authentication
- **Refresh Tokens** - Extended sessions without password re-entry
- **Password Hashing** - bcrypt with salt for password security
- **Role-Based Access** - Admin routes protected with user role checks
- **CORS** - Cross-Origin Resource Sharing configured
- **HTTPS Ready** - SSL/TLS support for production

### Data Protection
- **Pydantic Validation** - Input validation and sanitization
- **Email Validation** - RFC-compliant email verification
- **Database Indexing** - Optimize queries and prevent duplicates
- **Environment Variables** - Sensitive config in .env (not in code)

### Infrastructure Security
- **Non-Root Users** - Docker containers run as unprivileged users
- **Security Headers** - X-Frame-Options, X-Content-Type-Options, etc.
- **Nginx Hardening** - Gzip compression, rate limiting ready
- **Secret Management** - JWT secrets never committed to git

---

## 🧪 Testing

### Backend Tests
```bash
# Run all tests
docker-compose exec backend python -m pytest tests/ -v

# Run with coverage
docker-compose exec backend python -m pytest tests/ --cov=app

# Run specific test
docker-compose exec backend python -m pytest tests/test_main.py::TestAuth -v
```

### Frontend Tests
```bash
# Run linting
docker-compose exec frontend npm run lint

# Build for production (test build)
docker-compose exec frontend npm run build

# Run unit tests (if configured)
docker-compose exec frontend npm run test
```

### CI/CD Tests
GitHub Actions automatically runs tests on:
- Push to `main` branch
- Pull requests to `main`
- Push to `develop` branch

See `.github/workflows/ci-cd.yml` for workflow details.

---

## 📦 Deployment (Production)

### Docker Compose File for Production
Update `docker-compose.yml` for production:
```yaml
version: '3.8'
services:
  mongo:
    image: mongo:7.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    restart: always
    volumes:
      - mongo-data:/data/db

  backend:
    image: ghcr.io/your-username/product-shop-backend:latest
    environment:
      MONGO_URL: mongodb://admin:${MONGO_PASSWORD}@mongo:27017/?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
    restart: always
    depends_on:
      mongo:
        condition: service_healthy

  frontend:
    image: ghcr.io/your-username/product-shop-frontend:latest
    restart: always
    ports:
      - "443:443"
    environment:
      VITE_API_URL: https://api.yourdomain.com

volumes:
  mongo-data:

networks:
  default:
    name: product-shop-network
```

### Deployment Steps
1. **Prepare Remote Server:** Install Docker and Docker Compose
2. **Configure Secrets:** Set environment variables on server
3. **Pull Latest Images:** `docker pull ghcr.io/...`
4. **Start Services:** `docker-compose up -d`
5. **Monitor Logs:** `docker-compose logs -f`
6. **Setup SSL:** Use Certbot with Nginx for HTTPS

### GitHub Actions CI/CD
Automatic deployment on push to main:
1. Run tests (backend pytest, frontend lint/build)
2. Build Docker images
3. Push to GitHub Container Registry (GHCR)
4. Deploy to remote server via SSH

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Docker Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Restart service
docker-compose restart backend

# Rebuild image
docker-compose build --no-cache backend
docker-compose up -d
```

#### Port Already in Use
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process (Windows)
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
# - "9000:8000"  # Use 9000 instead
```

#### MongoDB Connection Fails
```bash
# Check MongoDB health
docker-compose ps mongo

# View MongoDB logs
docker-compose logs mongo

# Restart MongoDB
docker-compose restart mongo
```

#### Frontend Build Fails
```bash
# Clear node modules and reinstall
docker-compose exec frontend rm -rf node_modules
docker-compose exec frontend npm ci

# Rebuild image
docker-compose build --no-cache frontend
```

#### JWT Token Expired
- Tokens expire after `ACCESS_TOKEN_EXPIRE_MINUTES` (default 30 min)
- Use refresh token endpoint to get new access token
- Frontend should automatically refresh expired tokens

#### Email Not Sending
```bash
# Check SMTP configuration in .env
# Verify email credentials are correct
# Check Gmail app password (not regular password)
# View email service logs
docker-compose logs backend | grep email
```

#### CORS Error in Frontend
```bash
# Update ALLOWED_ORIGINS in .env
ALLOWED_ORIGINS=http://localhost:3000,http://your-domain.com

# Restart backend to apply changes
docker-compose restart backend
```

---

## 📖 Documentation Files

| File | Purpose | Read Time |
|------|---------|-----------|
| `DOCKER.md` | Complete Docker reference and deployment guide | 15-20 min |
| `DOCKER_QUICK_REFERENCE.md` | Daily commands cheat sheet | 5 min |
| `DOCKER_COMPLETE_SETUP_GUIDE.md` | Step-by-step beginner tutorial | 20-25 min |
| `DOCKER_SETUP_GUIDE_INDEX.md` | Navigation guide for all docs | 5 min |
| `ENV_VARIABLES.md` | Frontend environment variables | 5 min |
| `Readme.md` | This file - project overview | 10 min |

---

## 🔄 Development Workflow

### Local Development Loop
```bash
# 1. Start all services
docker-compose up -d

# 2. Make code changes
# Edit files in Backend/app or Frontend/src

# 3. Rebuild affected service
docker-compose build backend
docker-compose up -d backend

# 4. View logs for debugging
docker-compose logs -f backend

# 5. Test changes
# Open http://localhost:3000 in browser

# 6. Stop when done
docker-compose down
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and test locally
# ... edit files and test with docker-compose

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create Pull Request on GitHub
# CI/CD pipeline runs automatically
# After approval, merge to main
```

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (User)                       │
│                   (http://localhost:3000)                │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│         Frontend (React + Vite on Nginx)                 │
│  - Single Page Application (SPA)                         │
│  - Dark Mode, Shopping Cart, Favorites                   │
│  - Responsive Design (Mobile-first)                      │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              Backend (FastAPI on Uvicorn)                │
│  - REST API (GET, POST, PUT, DELETE)                     │
│  - JWT Authentication                                    │
│  - Product, Cart, User, Admin Routes                     │
│  - Email Background Tasks                                │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              Database (MongoDB 7.0)                       │
│  - Collections: users, products, carts, favorites        │
│  - Indexing for performance                              │
│  - Persistent volumes for data survival                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🤝 Contributing

### Before Contributing
1. Fork the repository
2. Create a branch for your feature
3. Set up local development environment
4. Make your changes
5. Run tests locally
6. Submit pull request

### Code Standards
- **Backend:** Follow PEP 8, use type hints, add docstrings
- **Frontend:** Use ESLint config provided, follow React best practices
- **Commits:** Write clear, descriptive commit messages
- **Tests:** Add tests for new features, ensure all tests pass

### Reporting Issues
Include:
- Description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Docker version, Browser)
- Error logs/screenshots

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🆘 Support & Help

### Getting Help
- **Documentation:** See DOCKER.md and other .md files
- **API Docs:** http://localhost:8000/docs (when running)
- **GitHub Issues:** Create an issue on the repository
- **Discussions:** Use GitHub Discussions for questions

### Common Commands Reference
```bash
# Docker commands
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose ps                 # Check status
docker-compose logs -f            # View logs
docker-compose exec backend bash  # Enter container

# Testing
python -m pytest tests/ -v        # Run backend tests
npm run lint                      # Run frontend linter

# Database
docker-compose exec mongo mongosh # Access MongoDB shell
```

---

## 📈 Future Roadmap

- [ ] Payment Gateway Integration (Stripe/PayPal)
- [ ] Order History and Tracking
- [ ] Product Reviews and Ratings
- [ ] Wishlist Feature
- [ ] Advanced Search and Filters
- [ ] Automated Email Notifications
- [ ] Mobile App (React Native)
- [ ] GraphQL API Option
- [ ] Kubernetes Deployment
- [ ] Performance Monitoring (APM)

---

## 👥 Team

- **Backend Developer:** FastAPI expertise
- **Frontend Developer:** React/Vite expertise
- **DevOps Engineer:** Docker/CI-CD expertise
- **Database Admin:** MongoDB expertise

---

**Last Updated:** February 2026  
**Status:** ✅ Production Ready  
**Version:** 2.0.0
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
