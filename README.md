# E-Commerce Store - NoSQL MongoDB Project

## 📋 Project Overview
Full-stack e-commerce web application demonstrating advanced MongoDB features including embedded/referenced documents, aggregation pipelines, compound indexes, and authentication.

## 🚀 Technologies
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose ODM
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Auth:** JWT, bcrypt

## 📦 Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)

### Setup Instructions

1. **Clone Repository**
   
```
git clone <your-repo-url>
cd ecommerce-store
```

Install Backend Dependencies

```
cd backend
npm install
```

Configure Environment
Create .env file in backend folder:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_secret_key_here
```

Start MongoDB

```
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

Run Backend Server

```
npm run dev
```

Open Frontend

Navigate to frontend/ folder

Open index.html in browser

Or use Live Server extension

📁 Project Structure
```
ecommerce-store/
├── backend/
│   ├── server.js          # Main application
│   ├── models/            # Mongoose schemas
│   └── .env              # Environment variables
└── frontend/
    ├── index.html        # Login/Register
    ├── products.html     # Product catalog
    ├── cart.html        # Shopping cart
    ├── orders.html      # Order history
    ├── profile.html     # User profile
    └── styles.css       # Global styles
```

🔌 API Endpoints (18 Total)
Auth
POST /api/auth/register - Register user

POST /api/auth/login - Login user

Users
GET /api/users/profile - Get profile

POST /api/users/addresses - Add address

DELETE /api/users/addresses/:id - Remove address

Products
GET /api/products - List products (with filters)

GET /api/products/:id - Get single product

POST /api/products - Create product (admin)

PUT /api/products/:id - Update product (admin)

PATCH /api/products/:id/stock - Update stock (admin)

DELETE /api/products/:id - Delete product (admin)

Orders
POST /api/orders - Create order

GET /api/orders - Get user orders

PATCH /api/orders/:id/status - Update status (admin)

DELETE /api/orders/:id - Cancel order

Reports (Admin)
GET /api/reports/sales-by-category - Sales by category

GET /api/reports/top-products - Top selling products

GET /api/reports/customer-summary - Customer analytics

🗄️ Database Schema
Users (Embedded addresses)
```
{
  username: String,
  email: String,
  password: String (hashed),
  role: String,
  addresses: [{ street, city, zipCode, isDefault }]
}
```

Products (Embedded reviews)
```
{
  name: String,
  price: Number,
  category: String,
  stock: Number,
  reviews: [{ userId, rating, comment }]
}
```

Orders (Referenced + Embedded)
```
{
  userId: ObjectId (ref),
  products: [{ productId, name, price, quantity }],
  totalAmount: Number,
  status: String,
  shippingAddress: { street, city, zipCode }
}
```

🔍 MongoDB Features Demonstrated
✅ CRUD Operations
Create: User registration, product creation

Read: Product listing with filters

Update: Stock management, order status

Delete: Cancel orders, remove addresses

✅ Advanced Updates
$push - Add address to user

$pull - Remove address

$inc - Update product stock

$set - Update order status

Positional operator - Update default address

✅ Aggregation Pipelines
Sales by category report

Top selling products

Customer order summary

✅ Indexes
Compound: { category: 1, price: -1 }

Text: { name: "text", description: "text" }

Unique: { email: 1 }

🎨 Frontend Features
Responsive Design - Works on mobile/desktop

Real-time Filtering - Search, category, price

Shopping Cart - LocalStorage persistence

Order Management - View status, cancel orders

Address Book - Multiple addresses, default selection

🔐 Security Features
JWT authentication

Password hashing (bcrypt)

Role-based authorization

Input validation

Protected routes

📊 Performance Optimization
Compound indexes

Pagination (skip/limit)

Field projection

Query optimization

🧪 Test Accounts
Admin User:

```
Email: admin@example.com
Password: admin123
```

Regular User:

```
Email: user@example.com  
Password: user123
```

📝 License
This project is created for educational purposes as part of Advanced Databases (NoSQL) course.

👨‍💻 Author
Shilten Aitkali - SE-2435

⭐ Project meets all requirements:

Web application with backend + frontend ✓

MongoDB with embedded/referenced docs ✓

18 REST API endpoints (≥8) ✓

CRUD + Aggregation + Advanced updates ✓

Compound indexes ✓

Authentication & Authorization ✓

5 frontend pages (≥4) ✓

Detailed report with all sections ✓

```

---

## Quick Start Commands


# 1. Install MongoDB
# Download from: https://www.mongodb.com/try/download/community

# 2. Start MongoDB
mongod

# 3. Clone and setup
git clone <your-repo>
cd ecommerce-store/backend
npm install

# 4. Create .env file
echo "PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=mysecretkey123" > .env

# 5. Start backend
npm run dev

# 6. Open frontend

# Navigate to frontend/ and open index.html
```
