const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => { //returns boolean
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!isValid(username)) {
        // If user does not exist, register them
        users.push({ username, password });
        return res.status(201).json({ message: "User registered successfully" });
    } else if (authenticatedUser(username, password)) {
        // If user exists and credentials match, authenticate them
        const token = jwt.sign({ username }, 'access', { expiresIn: 60 * 60 });
        return res.status(200).json({ token });
    } else {
        // If user exists but credentials do not match
        return res.status(401).json({ message: "Invalid username or password" });
    }
});
// Add a book review
const authenticateToken = (req, res, next) => {
    // Log the request headers to debug
    console.log("Request Headers:", req.headers);

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        console.log("No token found in the header");
        return res.status(401).json({ message: "No token provided." });
    }

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) {
            console.log("Token verification failed:", err);
            return res.status(403).json({ message: "Forbidden." });
        }
        req.user = user;
        next();
    });
};

regd_users.get("/test-token", authenticateToken, (req, res) => {
    res.status(200).json({ message: "Token received!", user: req.user });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", authenticateToken, (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const { username } = req.user;

    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added or updated successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
