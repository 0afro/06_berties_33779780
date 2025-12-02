const express = require("express");
const router = express.Router();

// GET /api/books – JSON API with filters
router.get('/books', function (req, res, next) {

    // Read query parameters
    let search = req.query.search;
    let min = req.query.minprice;
    let max = req.query.maxprice;
    let sort = req.query.sort;

    // Start with base query
    let sqlquery = "SELECT * FROM books";

    // SEARCH filter
    if (search) {
        sqlquery = `SELECT * FROM books WHERE name LIKE '%${search}%'`;
    }

    // PRICE RANGE filter
    if (min && max) {
        sqlquery = `SELECT * FROM books WHERE price BETWEEN ${min} AND ${max}`;
    }

    // SORTING
    if (sort === "name") {
        sqlquery += " ORDER BY name ASC";
    }
    if (sort === "price") {
        sqlquery += " ORDER BY price ASC";
    }

    db.query(sqlquery, (err, result) => {
        if (err) {
            res.json(err);
            return next(err);
        } else {
            res.json(result);
        }
    });
});

module.exports = router;
