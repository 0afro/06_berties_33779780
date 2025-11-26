# Insert data into the tables

USE berties_books;

# Insert sample books
INSERT INTO books (name, price)
VALUES
    ('Brighton Rock', 20.25),
    ('Brave New World', 25.00),
    ('Animal Farm', 12.99);

# Remove existing gold user (avoids duplicate errors)
DELETE FROM users WHERE username = 'gold';

# Required test user for marking
INSERT INTO users (username, first_name, last_name, email, hashedPassword)
VALUES
(
    'gold',
    'Gold',
    'User',
    'gold@example.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at3yP52uF2rGa'
);
