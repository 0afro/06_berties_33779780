// Create a new router
const express = require("express")
const router = express.Router()

router.get('/search',function(req, res, next){
    res.render("search.ejs")
});

// Display the search form
router.get('/search', function (req, res, next) {
  res.render('search.ejs');
});

// Handle search results (advanced search)
router.post('/search_result', function (req, res, next) {
  let keyword = req.body.keyword;
  // SQL query for partial match search
  let sqlquery = "SELECT * FROM books WHERE name LIKE ?";
  // Add wildcards so MySQL matches any part of the title
  let searchTerm = ['%' + keyword + '%'];

  db.query(sqlquery, searchTerm, (err, result) => {
    if (err) {
      next(err);
    } else {
      res.render('list.ejs', {
        availableBooks: result,
        pageTitle: `Search Results for "${keyword}"`
      });
    }
  });
});



router.get('/list', function (req, res, next) {
  let sqlquery = "SELECT * FROM books";

  db.query(sqlquery, (err, result) => {
    if (err) {
      next(err);
    } else {
      res.render('list.ejs', { 
        availableBooks: result,
        pageTitle: 'Book List'
      });
    }
  });
});

// Display the Add Book form
router.get('/addbook', function (req, res, next) {
  res.render('addbook.ejs');
});

// Handle form submission
router.post('/bookadded', function (req, res, next) {
  let sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";
  let newrecord = [req.body.name, req.body.price];

  db.query(sqlquery, newrecord, (err, result) => {
    if (err) {
      next(err);
    } else {
      res.send(' This book was added: ' + req.body.name + ' (£' + req.body.price + ')');
    }
  });
});

// Bargain books route – lists all books priced under £20
router.get('/bargainbooks', function (req, res, next) {
  let sqlquery = "SELECT * FROM books WHERE price < 20";

  db.query(sqlquery, (err, result) => {
    if (err) {
      next(err);
    } else {
      // reuse the same list.ejs template
      res.render('list.ejs', { availableBooks: result, pageTitle: 'Bargain Books (Under £20)' });
    }
  });
});


// Export the router object so index.js can access it
module.exports = router
