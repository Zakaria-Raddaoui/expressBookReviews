const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');

const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username)) {
        return res.status(400).json({ message: "Username already exists" });
    }

    users.push({ username, password });

    return res.status(201).json({ message: "User registered successfully" });
});


// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.status(200).send(JSON.stringify(books, null, 2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const book = books[isbn];

    if (book) {
        res.status(200).json(book);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});


public_users.get('/', (req, res) => {
    axios.get('https://raddaouizaka-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books')
        .then(response => {
            res.json(response.data);
        })
        .catch(error => {
            console.error("Error fetching book list:", error);
            res.status(500).json({ message: "Error fetching book list" });
        });
});

//  getting the book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const { isbn } = req.params;

    try {
        const response = await axios.get(`https://raddaouizaka-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/book/${isbn}`); // Replace with the correct endpoint
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching book details:", error);
        res.status(500).json({ message: "Error fetching book details" });
    }
});

//getting the book details based on Author 
public_users.get('/author/:author', (req, res) => {
  const { author } = req.params;

  axios.get(`https://raddaouizaka-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books/author/${author}`);
    then(response => {
      res.json(response.data);
    })
    .catch(error => {
      console.error("Error fetching books by author:", error);
      res.status(500).json({ message: "Error fetching books by author" });
    });
});

//getting the book details based on Title 
public_users.get('/title/:title', (req, res) => {
  const { title } = req.params;

  axios.get(`https://raddaouizaka-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books/title/${title}`);
    then(response => {
      res.json(response.data);
    })
    .catch(error => {
      console.error("Error fetching books by title:", error);
      res.status(500).json({ message: "Error fetching books by title" });
    });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const bookKeys = Object.keys(books); // Obtain all the keys for the ‘books’ object
    const booksByAuthor = [];

    bookKeys.forEach((key) => {
        if (books[key].author === author) {
            booksByAuthor.push(books[key]);
        }
    });

    if (booksByAuthor.length > 0) {
        res.status(200).json(booksByAuthor);
    } else {
        res.status(404).json({ message: "No books found by this author" });
    }
});
// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const bookKeys = Object.keys(books);
    const booksByTitle = [];

    bookKeys.forEach((key) => {
        if (books[key].title === title) {
            booksByTitle.push(books[key]);
        }
    });

    if (booksByTitle.length > 0) {
        res.status(200).json(booksByTitle);
    } else {
        res.status(404).json({ message: "No books found with this title" });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        if (book.reviews && book.reviews.length > 0) {
            res.status(200).json(book.reviews);
        } else {
            res.status(404).json({ message: "No reviews found for this book" });
        }
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

regd_users.delete("/auth/review/:isbn", authenticateToken, (req, res) => {
    const { isbn } = req.params;
    const { username } = req.user;

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if reviews exist for the book
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found" });
    }

    // Delete the review for the current user
    delete books[isbn].reviews[username];

    // Respond with success message
    return res.status(200).json({ message: "Review deleted successfully" });
});


module.exports.general = public_users;
