// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")

const saltRounds = 10



router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

// Show login form
router.get('/login', function(req, res, next) {
    res.render('login.ejs');
});

// GET /users/list
router.get('/list', function (req, res, next) {

    let sql = "SELECT username, first_name, last_name, email FROM users"

    db.query(sql, function(err, results) {
        if (err) {
            console.log(err)
            res.send("Error reading users database")
        } else {
            res.render('listusers.ejs', { users: results })
        }
    })
})

router.get('/audit', function(req, res, next) {

    let sql = "SELECT username, success, time FROM audit_log ORDER BY time DESC";

    db.query(sql, function(err, result) {
        if (err) {
            console.log(err);
            return res.send("Error reading audit log");
        }

        res.render('audit.ejs', { logs: result });
    });
});


//registered
router.post('/registered', function (req, res, next) {

    const plainPassword = req.body.password

    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {

        if (err) {
            return res.send("Error hashing password")
        }

        // Insert into MySQL
        let sql = `
            INSERT INTO users 
            (username, first_name, last_name, email, hashedPassword)
            VALUES (?, ?, ?, ?, ?)
        `

        let values = [
            req.body.username,
            req.body.first,
            req.body.last,
            req.body.email,
            hashedPassword
        ]

        db.query(sql, values, function(err, result) {
            if (err) {
                console.log(err)
                return res.send("Error inserting user into database")
            }

            // Show passwords (temporary)
            let output = 'Hello ' + req.body.first + ' ' + req.body.last +
            ' you are now registered! We will send an email to ' + req.body.email

            output += '<br>Your password is: ' + req.body.password
            output += '<br>Your hashed password is: ' + hashedPassword

            res.send(output)
        })

    })
})

router.post('/loggedin', function(req, res, next) {

    let username = req.body.username;
    let password = req.body.password;

    // Step 1: get hashed password from DB
    let sql = "SELECT hashedPassword FROM users WHERE username = ?";

    db.query(sql, [username], function(err, result) {
        if (err) {
            console.log(err);
            return res.send("Database error during login");
        }

        // Username not found
        if (result.length === 0) {

            let logSql = "INSERT INTO audit_log (username, success) VALUES (?, ?)";
            db.query(logSql, [username, false]);

            return res.send("Login failed: username not found");
        }

        let hashedPassword = result[0].hashedPassword;

        // Compare entered password with stored hash
        bcrypt.compare(password, hashedPassword, function(err, match) {

            if (err) {
                console.log(err);
                return res.send("Error comparing passwords");
            }

            if (match === true) {

                // SUCCESS
                let logSql = "INSERT INTO audit_log (username, success) VALUES (?, ?)";
                db.query(logSql, [username, true]);

                return res.send("Login successful! Welcome back, " + username + ".");
            } 
            else {

                // FAILURE
                let logSql = "INSERT INTO audit_log (username, success) VALUES (?, ?)";
                db.query(logSql, [username, false]);

                return res.send("Login failed: incorrect password");
            }

        });
    });
});

// Export the router object so index.js can access it
module.exports = router
