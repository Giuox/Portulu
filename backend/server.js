const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { 
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'portulu-secret-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Health check (importante per Render)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Database Setup
const db = new sqlite3.Database('./portulu.db', (err) => {
  if (err) console.error('❌ Database error:', err);
  else console.log('✅ Database connected');
});

// Initialize Tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT CHECK(role IN ('customer', 'restaurant', 'rider', 'admin')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    rating REAL DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    min_order REAL DEFAULT 0,
    delivery_time TEXT DEFAULT '30-40 min',
    active BOOLEAN DEFAULT 1,
    zones TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT,
    available BOOLEAN DEFAULT 1,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL,
    restaurant_id INTEGER NOT NULL,
    rider_id INTEGER,
    status TEXT CHECK(status IN ('new', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled')) DEFAULT 'new',
    items TEXT NOT NULL,
    subtotal REAL NOT NULL,
    delivery_fee REAL DEFAULT 0,
    total REAL NOT NULL,
    payment_method TEXT,
    delivery_address TEXT NOT NULL,
    delivery_zone TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    FOREIGN KEY (rider_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    delivery_fee REAL NOT NULL
  )`);

  const zones = [
    ['Scicli Centro', 0],
    ['Sampieri', 3],
    ['Donnalucata', 3],
    ["Cava d'Aliga", 3.5],
    ['Playa Grande', 2.5]
  ];

  const stmt = db.prepare('INSERT OR IGNORE INTO zones (name, delivery_fee) VALUES (?, ?)');
  zones.forEach(zone => stmt.run(zone));
  stmt.finalize();

  console.log('✅ Database tables initialized');
});

// Auth Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

// ===== AUTH ROUTES =====
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, phone, role } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, name, phone, role || 'customer'],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email già registrata' });
          }
          return res.status(500).json({ error: err.message });
        }
        
        const token = jwt.sign({ id: this.lastID, role: role || 'customer' }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, userId: this.lastID, role: role || 'customer', name });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Credenziali non valide' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenziali non valide' });
    
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, userId: user.id, role: user.role, name: user.name });
  });
});

// ===== ZONES ROUTES =====
app.get('/api/zones', (req, res) => {
  db.all('SELECT * FROM zones', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ===== RESTAURANTS ROUTES =====
app.get('/api/restaurants', (req, res) => {
  const { zone } = req.query;
  
  let query = 'SELECT * FROM restaurants WHERE active = 1';
  const params = [];
  
  if (zone) {
    query += ' AND zones LIKE ?';
    params.push(`%${zone}%`);
  }
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/restaurants/:id/menu', (req, res) => {
  db.all(
    'SELECT * FROM menu_items WHERE restaurant_id = ?',
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// ===== ORDERS ROUTES =====
app.post('/api/orders', authenticate, (req, res) => {
  const {
    restaurant_id, items, subtotal, delivery_fee, total,
    payment_method, delivery_address, delivery_zone,
    customer_phone, customer_name, notes
  } = req.body;
  
  const orderNumber = 'ORD' + Date.now().toString().slice(-6);
  
  db.run(
    `INSERT INTO orders (
      order_number, customer_id, restaurant_id, items, subtotal, 
      delivery_fee, total, payment_method, delivery_address, 
      delivery_zone, customer_phone, customer_name, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderNumber, req.userId, restaurant_id, JSON.stringify(items),
      subtotal, delivery_fee, total, payment_method, delivery_address,
      delivery_zone, customer_phone, customer_name, notes
    ],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      io.emit('new_order', { 
        orderId: this.lastID, 
        orderNumber, 
        restaurantId: restaurant_id 
      });
      
      res.json({ orderId: this.lastID, orderNumber });
    }
  );
});

app.get('/api/orders', authenticate, (req, res) => {
  let query = 'SELECT * FROM orders';
  let params = [];
  
  if (req.userRole === 'customer') {
    query += ' WHERE customer_id = ?';
    params.push(req.userId);
  } else if (req.userRole === 'rider') {
    query += ' WHERE rider_id = ? OR (status = ? AND rider_id IS NULL)';
    params.push(req.userId, 'ready');
  }
  
  query += ' ORDER BY created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(row => ({ ...row, items: JSON.parse(row.items) })));
  });
});

app.patch('/api/orders/:id/status', authenticate, (req, res) => {
  const { status } = req.body;
  
  db.run(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      io.emit('order_status_update', { orderId: req.params.id, status });
      res.json({ message: 'Status aggiornato' });
    }
  );
});

// ===== WEBSOCKET =====
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);
  socket.on('disconnect', () => console.log('❌ Client disconnected:', socket.id));
});

// ===== START SERVER =====
server.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════╗
  ║  🚀 PORTULU API ONLINE            ║
  ║  Port: ${PORT}                      ║
  ║  Environment: ${process.env.NODE_ENV || 'development'} ║
  ╚════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    db.close();
    console.log('HTTP server closed');
  });
});
