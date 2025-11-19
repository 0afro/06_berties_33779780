# Berties Books

Sample code for Dynamic Web Applications module.

Uses node.js with Express and EJS.

To install and run:

npm install
node index.js

## dotenv
I used the dotenv module to provide database credentials. The .env file is included in the repository because it uses the specific variables BB_USER, BB_PASSWORD and BB_DATABASE. In index.js, I load the variables with require('dotenv').config() and use process.env.BB_USER etc. to configure the MySQL connection.

## Audit Logging
I implemented an audit logging system to record both successful and failed login attempts. I created an audit_log table with columns for username, success (boolean) and timestamp. In the /users/loggedin route, I insert a new audit record each time a user attempts to log in. I also created a /users/audit route which selects all audit_log entries and displays them in audit.ejs for reviewing login activity.
