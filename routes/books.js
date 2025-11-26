const express = require("express");
const router = express.Router();

// Authorisation middleware
const redirectLogin = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.redirect('/usr/261/users/login');
    }
    next();
};

// Display the search form (public)
router.get('/search', function (req, res, next) {
    res.render('search.ejs');
});

// Handle search results (public)
router.post('/search_result', function (req, res, next) {
    let keyword = req.body.keyword;
    let sqlquery = "SELECT * FROM books WHERE name LIKE ?";
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

// Protected: list all books
router.get('/list', redirectLogin, function (req, res, next) {
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

// Protected: Add Book form
router.get('/addbook', redirectLogin, function (req, res, next) {
    res.render('addbook.ejs');
});

// Protected: Handle Add Book form
router.post('/bookadded', redirectLogin, function (req, res, next) {
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

// Protected: Bargain books
router.get('/bargainbooks', redirectLogin, function (req, res, next) {
    let sqlquery = "SELECT * FROM books WHERE price < 20";

    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.render('list.ejs', {
                availableBooks: result,
                pageTitle: 'Bargain Books (Under £20)'
            });
        }
    });
});

module.exports = router;
