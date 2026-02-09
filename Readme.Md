# Anozon E-Commerce Platform

A modern full-stack e-commerce application built with **FastAPI** backend and **React+Vite** frontend. Features product browsing, user authentication, shopping cart management, admin dashboard, and more.

---

## 🚀 Features

### Core Features
- **User Authentication** - Secure JWT-based login and registration system
- **Product Catalog** - Browse, search, and view detailed product information
- **Shopping Cart** - Add/remove products, manage quantities, and persist cart state
- **Favorites System** - Save favorite products for later viewing
- **Dark Mode** - Toggle between light and dark themes with persistent preference
- **Admin Dashboard** - Comprehensive admin panel for product and inventory management
- **Inventory Management** - Track product stock and availability
- **Search Functionality** - Quick product search across catalog
- **Responsive Design** - Mobile-friendly UI with component-based architecture
- **MongoDB Database** - Persistent data storage with flexible schema
- **RESTful API** - Clean, well-organized API endpoints with Swagger documentation

---

## 💻 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework for building APIs
- **MongoDB** - NoSQL database for flexible data storage
- **Python-jose** - JWT authentication and token management
- **Pydantic** - Data validation and settings management
- **Pytest** - Testing framework for unit and integration tests
- **Docker** - Containerization for consistent deployment

### Frontend
- **React 18** - UI library for building components
- **Vite** - Lightning-fast build tool and dev server
- **JavaScript (ES6+)** - Client-side logic
- **Tailwind CSS** - Styling and responsive design
- **Context API** - State management for auth, cart, and favorites
- **Docker** - Frontend containerization with Nginx

### DevOps & Deployment
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server and reverse proxy for frontend
- **Environment Configuration** - Flexible environment-based setup

---

## 📁 Project Structure

```
Anozon-E-commerce/
├── Backend/                          # FastAPI application
│   ├── app/
│   │   ├── main.py                  # Application entry point
│   │   ├── core/                    # Configuration & security
│   │   │   ├── config.py            # Environment configuration
│   │   │   ├── logger.py            # Logging setup
│   │   │   ├── security.py          # Authentication & security
│   │   │   └── time_utils.py        # Time utilities
│   │   ├── models/                  # Database models
│   │   │   ├── user_model.py        # User schema
│   │   │   ├── product_model.py     # Product schema
│   │   │   └── email_model.py       # Email schema
│   │   ├── routes/                  # API endpoints
│   │   │   ├── auth_user.py         # Authentication routes
│   │   │   ├── user_routes.py       # User management routes
│   │   │   ├── product_routes.py    # Product endpoints
│   │   │   ├── admin_routes.py      # Admin-only endpoints
│   │   │   ├── protected.py         # Protected endpoints
│   │   │   └── bacground_email.py   # Email task routes
│   │   ├── services/                # Business logic
│   │   │   ├── user_service.py      # User operations
│   │   │   ├── product_service.py   # Product operations
│   │   │   └── inventory_service.py # Inventory management
│   │   ├── db/
│   │   │   └── mongodb.py           # Database connection
│   │   ├── deps/
│   │   │   └── auth.py              # Authentication dependencies
│   │   └── utils/
│   │       └── email_sender.py      # Email utility functions
│   ├── tests/                       # Test suite
│   │   ├── __init__.py
│   │   └── test_main.py             # Main tests
│   ├── dockerfile                   # Docker image configuration
│   ├── requirements.txt              # Python dependencies
│   ├── server.py                    # Server launcher
│   └── tests.http                   # HTTP testing file
│
├── Frontend/                        # React application
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   ├── NavComp.jsx          # Secondary nav component
│   │   │   ├── SearchBar.jsx        # Product search
│   │   │   ├── ProductCard.jsx      # Product display card
│   │   │   ├── AddToCartButton.jsx  # Cart add button
│   │   │   ├── ContinueShopping.jsx # Continue shopping component
│   │   │   ├── DarkMode.jsx         # Theme toggle
│   │   │   ├── Favouites.jsx        # Favorites display
│   │   │   └── Footer.jsx           # Footer component
│   │   ├── pages/                   # Page components
│   │   │   ├── ProductList.jsx      # Product listing page
│   │   │   ├── ProductDetails.jsx   # Product detail view
│   │   │   ├── Cart.jsx             # Shopping cart page
│   │   │   ├── AdminDashboard.jsx   # Admin management panel
│   │   │   ├── Login.jsx            # Login page
│   │   │   └── Signup.jsx           # User registration page
│   │   ├── context/                 # Context API providers
│   │   │   ├── AuthContext.jsx      # Authentication state
│   │   │   ├── CartContext.jsx      # Cart state management
│   │   │   └── FavoritesContext.jsx # Favorites state
│   │   ├── services/                # API service layer
│   │   │   ├── auth.js              # Authentication API calls
│   │   │   ├── products.js          # Product API calls
│   │   │   ├── cart.js              # Cart API calls
│   │   │   ├── favorites.js         # Favorites API calls
│   │   │   ├── Navbar.js            # Navbar services
│   │   │   └── Girls.js             # Category-specific services
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # React entry point
│   │   ├── App.css                  # App styles
│   │   ├── index.css                # Global styles
│   │   └── assets/                  # Static assets
│   ├── public/                      # Static files
│   ├── dockerfile                   # Docker image configuration
│   ├── nginx.conf                   # Nginx configuration
│   ├── package.json                 # Node dependencies
│   ├── vite.config.js               # Vite configuration
│   ├── eslint.config.js             # ESLint rules
│   ├── ENV_VARIABLES.md             # Environment variables guide
│   └── requirements.txt              # Installation requirements
│
├── docker-compose.yml               # Multi-container orchestration
├── DOCKER.md                        # Docker setup guide
├── CONTAINERIZED.md                 # Containerization documentation
└── Readme.Md                        # This file
```

---

## 🛠️ Installation

### Prerequisites
- Python 3.8+
- Node.js 14+ and npm
- MongoDB (local or Atlas)
- Docker & Docker Compose (optional, for containerized setup)

### Option 1: Local Setup (Without Docker)

#### Backend Setup

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

4. Configure environment variables:
   - Edit `app/core/config.py` with your settings:
     - MongoDB connection string
     - JWT secret key
     - Email configuration
     - API settings

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Create a `.env` file or check `ENV_VARIABLES.md` for required variables
   - Set API endpoint to point to your backend (`http://localhost:8000`)

### Option 2: Docker Setup (Recommended)

1. Ensure Docker and Docker Compose are installed

2. Configure environment variables:
   - Update `docker-compose.yml` with your MongoDB URI and other settings
   - Update environment variables in each service as needed

3. Build and run containers:
```bash
docker-compose up --build
```

This will start both backend and frontend services in containers.

**For detailed Docker setup, see [DOCKER.md](DOCKER.md) and [CONTAINERIZED.md](CONTAINERIZED.md)**

---

## ▶️ Running the Application

### Local Development (Without Docker)

#### Start Backend Server

```bash
cd Backend
python server.py
```

Backend runs on: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs` (Swagger UI)

#### Start Frontend Development Server

```bash
cd Frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

### Docker Deployment

```bash
docker-compose up
```

Backend: `http://localhost:8000`
Frontend: `http://localhost:3000` (or configured port)

### Running Tests

#### Backend Tests

```bash
cd Backend
pytest tests/
```

Or run specific test file:
```bash
pytest tests/test_main.py -v
```

#### HTTP Testing

Use the provided `tests.http` file for manual API testing with HTTP client tools like:
- REST Client (VS Code extension)
- Postman
- Insomnia

```bash
Backend/tests.http
```

---

## 📚 API Endpoints

### Authentication Routes (`/auth`)
- `POST /auth/login` - User login with credentials
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

### User Routes (`/users`)
- `GET /users/{id}` - Get user profile
- `PUT /users/{id}` - Update user information
- `GET /users/{id}/favorites` - Get user's favorite products

### Product Routes (`/products`)
- `GET /products` - Get all products with optional filtering/sorting
- `GET /products/{id}` - Get specific product details
- `GET /products/category/{category}` - Get products by category
- `POST /products` - Create new product (admin only)
- `PUT /products/{id}` - Update product (admin only)
- `DELETE /products/{id}` - Delete product (admin only)

### Admin Routes (`/admin`)
- `GET /admin/inventory` - View inventory management
- `PUT /admin/inventory/{id}` - Update product inventory
- `GET /admin/orders` - View all orders
- `GET /admin/users` - View all users
- `POST /admin/analytics` - Get sales analytics

### Cart Routes (`/cart`)
- `GET /cart` - Get current cart
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/{id}` - Update cart item quantity
- `DELETE /cart/items/{id}` - Remove item from cart
- `DELETE /cart` - Clear entire cart

### Favorites Routes (`/favorites`)
- `GET /favorites` - Get user's favorite items
- `POST /favorites` - Add item to favorites
- `DELETE /favorites/{id}` - Remove from favorites


### Protected Routes (`/protected`)
- `GET /protected` - Protected endpoint (requires authentication)

---

## 🎨 Features in Detail

### Product Management
- Browse complete product catalog with pagination
- View detailed product information including images, descriptions, and pricing
- Category-based product filtering
- Advanced search functionality across product titles and descriptions
- Admin dashboard for creating, updating, and deleting products
- Inventory tracking and management

### Shopping Cart
- Add and remove products from cart
- Update product quantities
- Real-time cart total calculation
- Persistent cart state using React Context API
- Continue shopping functionality
- Clear cart option

### Favorites System
- Save products to personal favorites list
- Quick access to favorite items
- Remove items from favorites
- Favorite count tracking per product

### User Authentication & Security
- Secure JWT-based authentication system
- Password encryption and secure storage
- Automatic token expiration and refresh
- Protected API endpoints requiring authentication
- User session management
- Role-based access control (Admin/User)

### Admin Dashboard
- Comprehensive admin panel for platform management
- Product CRUD operations (Create, Read, Update, Delete)
- Inventory management and stock tracking
- User management and monitoring
- Order viewing and processing
- Sales analytics and reporting

### User Interface
- Responsive design works on desktop, tablet, and mobile
- Dark mode toggle with persistent theme preference
- Modern navigation interface
- Product card components with images and ratings
- Search bar for quick product discovery
- Footer with company information

### Logging & Monitoring
- Comprehensive logging system for debugging
- Request/response logging
- Error tracking and reporting
- Performance monitoring

---

## 📝 Configuration

### Backend Configuration

Edit `Backend/app/core/config.py` to configure:
- **Database Settings**
  - MongoDB connection string (MONGODB_URI)
  - Database name selection
  
- **Authentication**
  - JWT secret key (SECRET_KEY) - must be strong and secret
  - Token expiration time (ACCESS_TOKEN_EXPIRE_MINUTES)
  - Algorithm (HS256 recommended)

- **Email Settings**
  - SMTP server configuration
  - Email sender address
  - Email password/API key

- **API Settings**
  - CORS allowed origins
  - Debug mode (development only)
  - API version

### Frontend Configuration

Edit configuration files in the `Frontend/` directory:

**`vite.config.js`**
- API proxy settings and endpoints
- Build optimization options
- Dev server port (default 5173)

**`.env` or `ENV_VARIABLES.md`**
- Backend API endpoint
- Authentication endpoints
- Feature flags

**`eslint.config.js`**
- Code style rules
- Linting strictness

**`nginx.conf`** (for Docker)
- Reverse proxy settings
- Static file serving
- Port configuration

### Docker Configuration

Edit `docker-compose.yml` to configure:
- Container ports mapping
- Environment variables for services
- MongoDB connection details
- Volume mounting
- Network settings

See [DOCKER.md](DOCKER.md) for detailed Docker configuration guide.

---

## 🌍 Deployment

### Production Deployment with Docker

1. Build production images:
```bash
docker-compose -f docker-compose.yml build
```

2. Push to registry (optional):
```bash
docker tag anozon-backend:latest your-registry/anozon-backend:latest
docker push your-registry/anozon-backend:latest
```

3. Deploy to server:
```bash
docker-compose -f docker-compose.yml up -d
```

4. Verify services:
```bash
docker-compose ps
```

### Cloud Deployment Options
- **Railway** - Easy Docker deployment
- **AWS ECS** - Container orchestration
- **Heroku** - Simplified deployment (though pricing has changed)
- **DigitalOcean** - Affordable VPS/container hosting
- **Render** - Free tier available

---

## 🐛 Troubleshooting

### Backend Issues

**Module not found errors:**
```bash
pip install -r Backend/requirements.txt
```

**MongoDB connection refused:**
- Ensure MongoDB is running (local or check Atlas connectivity)
- Verify connection string in `app/core/config.py`
- Check firewall and network settings

**Port 8000 already in use:**
```bash
python server.py --port 8001
```

### Frontend Issues

**npm packages not found:**
```bash
rm -rf Frontend/node_modules package-lock.json
npm install
```

**CORS errors:**
- Check backend CORS settings in `app/core/config.py`
- Ensure frontend URL is whitelisted
- Verify API endpoint in frontend configuration

**Port 5173 already in use:**
```bash
npm run dev -- --port 5174
```

### Docker Issues

**Container fails to start:**
```bash
docker-compose logs service-name  # Check logs
docker-compose down
docker-compose up --build  # Rebuild
```

**Network connectivity:**
```bash
docker network ls
docker network inspect anozon_network  # or your network name
```

---

## 📚 Additional Documentation

- [Docker Setup Guide](DOCKER.md) - Detailed containerization instructions
- [Containerization Notes](CONTAINERIZED.md) - Development with containers
- [Environment Variables](Frontend/ENV_VARIABLES.md) - Frontend environment setup
- [Requirements](Frontend/requirements.txt) - Node.js requirements
- [API Tests](Backend/tests.http) - Manual API testing examples

---

## 🔐 Security Considerations

- Always use environment variables for sensitive data (API keys, database URLs)
- Keep dependencies updated: `pip install --upgrade -r requirements.txt`
- Use strong JWT secret keys (minimum 32 characters)
- Enable HTTPS in production
- Validate and sanitize all user inputs
- Implement rate limiting for API endpoints
- Use CORS with specific allowed origins in production
- Regularly backup MongoDB data
- Implement authentication for all admin routes

---

## 📈 Performance Tips

- Enable MongoDB indexing on frequently queried fields
- Use pagination for large product lists
- Implement caching for product catalog
- Optimize frontend bundle size with tree-shaking
- Use CDN for static assets
- Monitor API response times with logging
- Consider database query optimization

---

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/Anozon-E-commerce.git
   cd Anozon-E-commerce
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow PEP 8 for Python code
   - Follow ESLint rules for JavaScript
   - Write descriptive commit messages

4. **Test your changes**
   - Backend: `pytest tests/`
   - Frontend: Manual testing or unit tests
   - Test API with provided `tests.http` file

5. **Submit a pull request**
   - Provide clear description of changes
   - Reference any related issues
   - Ensure all tests pass

### Code Style Guidelines
- **Python**: PEP 8, max line length 100
- **JavaScript**: ESLint configuration in `eslint.config.js`
- **Comments**: Clear, concise documentation
- **Git commits**: Use conventional commit format

---

## 📋 Project Roadmap

Future enhancements planned:
- [ ] Payment integration (Stripe/PayPal)
- [ ] User reviews and ratings
- [ ] Product recommendations engine
- [ ] Advanced inventory forecasting
- [ ] Mobile app (React Native)
- [ ] GraphQL API alternative
- [ ] Third-party integrations
- [ ] Enhanced analytics dashboard

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 💬 Support & Contact

For questions, issues, or suggestions:
- **Issues**: Open a GitHub issue with detailed description
- **Email**: harish13032003@gmail.com (example)
- **Documentation**: Check [DOCKER.md](DOCKER.md) and [CONTAINERIZED.md](CONTAINERIZED.md)
- **Stack Overflow**: Tag with `anozon-ecommerce`

---

## 🙏 Acknowledgments

- FastAPI documentation and community
- React and Vite ecosystem
- MongoDB flexible document model
- Open-source contributors

---

## 📊 Project Stats

- **Frontend**: React 18 with Vite
- **Backend**: FastAPI with MongoDB
- **Languages**: Python, JavaScript
- **Database**: MongoDB
- **Containerization**: Docker & Docker Compose
- **Testing**: Pytest framework
- **Code Style**: PEP 8, ESLint

---

**Last Updated**: February 2026

---

## Quick Links

- [Swagger API Docs](http://localhost:8000/docs) (when running)
- [Frontend Dev Server](http://localhost:5173) (when running)
- [Backend Server](http://localhost:8000) (when running)
- [Docker Compose Setup](docker-compose.yml)
- [Security Configuration](Backend/app/core/security.py)

This project is open source and available under the MIT License.

---

## 📧 Support

For questions or issues, please open an issue in the repository.

---

**Happy shopping! 🛍️**
