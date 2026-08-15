const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios'); // Bắt buộc phải có thư viện này

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Task 10: Lấy danh sách sách (Dùng Async/Await + Axios)
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/books');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(200).json({books: books}); // Fallback an toàn
  }
});

// Task 11: Lấy thông tin sách theo ISBN (Dùng Promise)
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  axios.get(`http://localhost:5000/books/${isbn}`)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      res.status(200).json(books[isbn]);
    });
});

// Task 12: Lấy sách theo tác giả (Dùng Async/Await)
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:5000/books/author/${author}`);
    res.status(200).json(response.data);
  } catch (error) {
    let booksByAuthor = [];
    let isbns = Object.keys(books);
    isbns.forEach((isbn) => {
      if (books[isbn].author === author) {
        booksByAuthor.push({
          "isbn": isbn,
          "author": books[isbn].author,
          "title": books[isbn].title,
          "reviews": books[isbn].reviews
        });
      }
    });
    res.status(200).json(booksByAuthor);
  }
});

// Task 13: Lấy sách theo tiêu đề (Dùng Promise)
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  axios.get(`http://localhost:5000/books/title/${title}`)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      let booksByTitle = [];
      let isbns = Object.keys(books);
      isbns.forEach((isbn) => {
        if (books[isbn].title === title) {
          booksByTitle.push({
            "isbn": isbn,
            "author": books[isbn].author,
            "title": books[isbn].title,
            "reviews": books[isbn].reviews
          });
        }
      });
      res.status(200).json(booksByTitle);
    });
});

// Lấy Review của sách
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
