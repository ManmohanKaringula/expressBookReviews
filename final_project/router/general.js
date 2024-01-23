const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// This middleware is used to register a new user
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  getBooksList()
  .then((booksList) => {
    res.send(JSON.stringify(booksList, null, 4));
  })
  .catch((error) => {
    console.error('Error fetching books:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  });
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn= req.params.isbn  
  // Calling the function that return a promise that return book list with ISBN on resolve
  getBooksListISBN(isbn) 
  .then((booklistISBN)=> {
    res.send(JSON.stringify(booklistISBN, null, 4));
  })
  .catch((error) => {
    console.error('Error fetching books with the given isbn:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  });
});

  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  getBooksListAuthor(author)
  .then((booklistAuthor)=>{
    res.send(JSON.stringify(booklistAuthor, null, 4))
  })
  .catch((error) => {
    console.error('Error fetching books with the given isbn:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  getBooksListTitle(title)
  .then((booklisttitle)=>{
    res.send(JSON.stringify(booklisttitle, null, 4))
  })
  .catch((error) => {
    console.error('Error fetching books with the given isbn:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const details = Object.keys(books).filter((key) => key === isbn);
  res.send(books[details].reviews)
});

// Below are the list of functions that are going to return promise when called each function is called according to the URL routes....

// function that returns a promise which fetches the books object......
function getBooksList() {
  return new Promise((resolve, reject) => {
    // Simulating an asynchronous operation (e.g., fetching from a database)
    setTimeout(() => {
      resolve(books);
    }, 1000);
  });
}

// function that returns a promise which fetches the book object using the isbn.....
function getBooksListISBN(isbn){
  return new Promise((resolve, reject)=> {
    resolve(books[isbn])
  });
}

// function that return a promise which fetches the book details based on the author name provided.....
function getBooksListAuthor(Author){
  return new Promise((resolve, reject)=> {
    const details = Object.values(books).filter(book => book.author  == Author);
    resolve(details);
  });

}

// function that returns a promise which fetches the book details basaed on the title provided...
function getBooksListTitle(Title)
{
return new Promise((resolve, reject)=>{
  const details = Object.values(books).filter(book => book.title  == Title);
  resolve(details);
});

}


module.exports.general = public_users;
