const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}


const authenticatedUser = (username,password)=>{   
  let validusers = users.filter((user)=>{
  return (user.username === username && user.password === password)
});
if(validusers.length > 0){
  return true;
} else {
  return false;
}
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }
  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    // for every session object there exists a single accesstoken for the single user  
    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!isbn || !review) {
    return res.status(400).json({ error: 'ISBN and review are required' });
  }

  const bookFoundWithIsbn = books[isbn];

  if (!bookFoundWithIsbn) {
    return res.status(404).json({ error: "Book not found" });
  }

  if (bookFoundWithIsbn.reviews && bookFoundWithIsbn.reviews[username]) {
    // If there exists a review previously, this code just updates it
    bookFoundWithIsbn.reviews[username] = review;
    res.status(200).json({ message: `Review for book with ISBN ${isbn} has been updated` });
  } else {
    // It inserts the first review submitted
    bookFoundWithIsbn.reviews = bookFoundWithIsbn.reviews || {};
    bookFoundWithIsbn.reviews[username] = review;
    res.status(201).json({ message: `Review for book with ISBN ${isbn} has been inserted` });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  
  const username = req.session.authorization.username;
  const bookFoundWithIsbn = books[isbn];

  if (bookFoundWithIsbn.reviews[username]){
    delete bookFoundWithIsbn.reviews[username];
    res.status(200).json({message: `Reviews for the ISBN ${isbn} by the user ${username} has been deleted`});
  }
  else{
    res.status(200).json({message: `There is no review from the user ${username} for the book with ISBN $(isbn)`});
  }

});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
