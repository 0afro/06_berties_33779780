// Import express and ejs and sql
var mysql = require('mysql2');
var express = require('express');
var ejs = require('ejs');
var session = require('express-session');
const path = require('path');
require('dotenv').config();

// Create the express application object
const app = express();
const port = 8000;

// Body parser
app.use(express.urlencoded({ extended: true }));

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs');

// Set up public folder (for css and static js)
app.use(express.static(path.join(__dirname, 'public')));

// Define our application-specific data
app.locals.shopData = { shopName: "Bertie's Books" };

// Define the database connection pool (USING BB_ VARS)
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

global.db = db;

// Create a session
app.use(session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

// Load the route handlers
const mainRoutes = require("./routes/main");
app.use('/', mainRoutes);

// Load the route handlers for /users
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

// Load the route handlers for /books
const booksRoutes = require('./routes/books');
app.use('/books', booksRoutes);

// Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
