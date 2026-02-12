const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ============ CORS НАСТРОЙКИ ============
app.use(cors({
    origin: [
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'http://192.168.10.13:5500',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ========================================

// ============ ТЕСТОВЫЙ МАРШРУТ ============
app.get('/', (req, res) => {
    res.json({ 
        message: 'E-Commerce API работает!', 
        status: 'online',
        time: new Date()
    });
});

app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Тестовый маршрут работает!', 
        api: 'доступен',
        ip: req.ip,
        time: new Date()
    });
});
// ========================================

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ============ ВАШИ СХЕМЫ ============
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    addresses: [{
        street: String,
        city: String,
        zipCode: String,
        isDefault: { type: Boolean, default: false }
    }],
    createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: String,
    stock: { type: Number, default: 0 },
    images: [String],
    rating: { type: Number, default: 0 },
    reviews: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
        rating: Number,
        comment: String,
        date: { type: Date, default: Date.now }
    }]
});

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: Number
    }],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
        street: String,
        city: String,
        zipCode: String
    },
    status: { 
        type: String, 
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
});

// Индексы
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 });
productSchema.index({ category: 1, price: -1 });
productSchema.index({ name: 'text', description: 'text' });
orderSchema.index({ userId: 1, createdAt: -1 });

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// ============ МИДЛВЕРЫ ============
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) throw new Error();
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey123456789');
        const user = await User.findById(decoded.userId);
        if (!user) throw new Error();
        
        req.user = user;
        req.userId = user._id;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

const admin = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// ============ AUTH ENDPOINTS ============
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            email,
            password: hashedPassword
        });
        
        await user.save();
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'mysecretkey123456789');
        res.status(201).json({ 
            user: { id: user._id, username, email, role: user.role }, 
            token 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'mysecretkey123456789');
        res.json({ 
            user: { id: user._id, username: user.username, email, role: user.role }, 
            token 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============ USER ENDPOINTS ============
app.get('/api/users/profile', auth, async (req, res) => {
    res.json(req.user);
});

app.post('/api/users/addresses', auth, async (req, res) => {
    try {
        const { street, city, zipCode, isDefault } = req.body;
        
        if (isDefault) {
            await User.updateMany(
                { _id: req.userId, 'addresses.isDefault': true },
                { $set: { 'addresses.$.isDefault': false } }
            );
        }
        
        const user = await User.findByIdAndUpdate(
            req.userId,
            { $push: { addresses: { street, city, zipCode, isDefault } } },
            { new: true }
        );
        
        res.json(user.addresses);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/users/addresses/:addressId', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.userId,
            { $pull: { addresses: { _id: req.params.addressId } } },
            { new: true }
        );
        res.json(user.addresses);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============ PRODUCT ENDPOINTS ============
app.get('/api/products', async (req, res) => {
    try {
        const { category, minPrice, maxPrice, search, page = 1, limit = 10 } = req.query;
        const query = {};
        
        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        
        let products;
        if (search) {
            products = await Product.find({ $text: { $search: search } })
                .skip((page - 1) * limit)
                .limit(Number(limit));
        } else {
            products = await Product.find(query)
                .skip((page - 1) * limit)
                .limit(Number(limit));
        }
        
        const total = await Product.countDocuments(query);
        
        res.json({
            products,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/products', auth, admin, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/products/:id', auth, admin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.patch('/api/products/:id/stock', auth, admin, async (req, res) => {
    try {
        const { quantity } = req.body;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $inc: { stock: quantity } },
            { new: true }
        );
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/products/:id', auth, admin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============ ORDER ENDPOINTS ============
app.post('/api/orders', auth, async (req, res) => {
    try {
        const { products, shippingAddress } = req.body;
        
        let totalAmount = 0;
        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ error: `Product ${item.productId} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }
            totalAmount += product.price * item.quantity;
            item.name = product.name;
            item.price = product.price;
        }
        
        const order = new Order({
            userId: req.userId,
            products,
            totalAmount,
            shippingAddress
        });
        
        for (const item of products) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: -item.quantity } }
            );
        }
        
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.userId })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.patch('/api/orders/:id/status', auth, admin, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { status } },
            { new: true }
        );
        res.json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/orders/:id', auth, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        if (order.status !== 'pending') {
            return res.status(400).json({ error: 'Cannot cancel non-pending order' });
        }
        
        for (const item of order.products) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: item.quantity } }
            );
        }
        
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============ AGGREGATION ENDPOINTS ============
app.get('/api/reports/sales-by-category', auth, admin, async (req, res) => {
    try {
        const report = await Order.aggregate([
            { $unwind: '$products' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $group: {
                    _id: '$productInfo.category',
                    totalSales: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
                    totalItems: { $sum: '$products.quantity' },
                    averagePrice: { $avg: '$products.price' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalSales: -1 } }
        ]);
        
        res.json(report);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============ ЗАПУСК СЕРВЕРА ============
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(50));
    console.log('✅ SERVER IS RUNNING!');
    console.log('='.repeat(50));
    console.log(`📍 Local:    http://localhost:${PORT}`);
    console.log(`📍 Network:  http://192.168.10.13:${PORT}`);
    console.log(`📍 IPv4:     http://127.0.0.1:${PORT}`);
    console.log('='.repeat(50) + '\n');
});