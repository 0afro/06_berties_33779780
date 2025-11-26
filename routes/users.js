const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const saltRounds = 10;

// --- Authorisation helper ---
const redirectLogin = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.redirect('users/login');
    }
    next();
};

// ------------------ PUBLIC ROUTES ------------------

// Register page
router.get('/register', function (req, res, next) {
    res.render('register.ejs');
});

// Login page
router.get('/login', function (req, res, next) {
    res.render('login.ejs');
});

router.post('/registered', function (req, res, next) {

    // First check if email already exists
    let checkEmailSql = "SELECT email FROM users WHERE email = ?";

    db.query(checkEmailSql, [req.body.email], function(err, results) {
        if (err) {
            console.log(err);
            return res.send("Error checking email");
        }

        if (results.length > 0) {
            return res.send("Error: This email is already registered.");
        }

        const plainPassword = req.body.password;

        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
            if (err) {
                return res.send("Error hashing password");
            }

            let sql = `
                INSERT INTO users 
                (username, first_name, last_name, email, hashedPassword)
                VALUES (?, ?, ?, ?, ?)
            `;

            let values = [
                req.body.username,
                req.body.first,
                req.body.last,
                req.body.email,
                hashedPassword
            ];

            db.query(sql, values, function(err, result) {
                if (err) {
                    console.log(err);
                    return res.send("Error inserting user into database");
                }

                // Final secure output — no password shown!
                res.send("Registration complete! Welcome, " + req.body.first + ".");
            });

        });

    });
});



// ------------------ LOGIN LOGIC ------------------

router.post('/loggedin', function (req, res, next) {

    let username = req.body.username;
    let password = req.body.password;

    let sql = "SELECT hashedPassword FROM users WHERE username = ?";

    db.query(sql, [username], function (err, result) {
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

        bcrypt.compare(password, hashedPassword, function (err, match) {

            if (err) {
                console.log(err);
                return res.send("Error comparing passwords");
            }

            if (match === true) {

                let logSql = "INSERT INTO audit_log (username, success) VALUES (?, ?)";
                db.query(logSql, [username, true]);

                // SAVE SESSION
                req.session.userId = username;

                return res.send("Login successful! Welcome back, " + username + ".");
            }
            else {

                let logSql = "INSERT INTO audit_log (username, success) VALUES (?, ?)";
                db.query(logSql, [username, false]);

                return res.send("Login failed: incorrect password");
            }

        });
    });
});


// ------------------ PROTECTED ROUTES ------------------

// Only logged in users can view the list
router.get('/list', redirectLogin, function (req, res, next) {

    let sql = "SELECT username, first_name, last_name, email FROM users";

    db.query(sql, function (err, results) {
        if (err) {
            console.log(err);
            res.send("Error reading users database");
        } else {
            res.render('listusers.ejs', { users: results });
        }
    });
});

// Audit log – MUST be protected
router.get('/audit', redirectLogin, function (req, res, next) {

    let sql = "SELECT username, success, time FROM audit_log ORDER BY time DESC";

    db.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            return res.send("Error reading audit log");
        }

        res.render('audit.ejs', { logs: result });
    });
});

module.exports = router;
