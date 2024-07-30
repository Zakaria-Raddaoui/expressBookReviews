const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Configure session middleware
app.use(session({
    secret: 'access',
    resave: false,
    saveUninitialized: false, 
    cookie: { secure: false }
}));

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Authenticate user (replace with real authentication logic)
    if (username === 'user' && password === 'pass') {
        // Create a JWT token
        const token = jwt.sign({ username }, 'access', { expiresIn: 60 * 60 });
        
        req.session.user = { username, token };
        
        res.json({ message: 'Logged in successfully', token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Authentication middleware using session
function auth(req, res, next) {
    const token = req.session?.user?.token;
    
    if (!token) return res.status(403).json({ message: 'No token provided.' });

    jwt.verify(token, 'access', (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Failed to authenticate token.' });
        
        // Attach user info to request object
        req.user = decoded;
        next();
    });
}

// Apply authentication middleware to routes requiring authentication
app.use("/customer/auth/*", auth);

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
