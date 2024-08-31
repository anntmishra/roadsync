// Import necessary modules
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const session = require('express-session'); // For session management

const app = express();
const port = 3000;

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Lpkoji@1920',
    database: 'registration_db'
});

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected...');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session middleware
app.use(session({
    secret: 'your-secret-key', // Change this to a secure key
    resave: false,
    saveUninitialized: true
}));

// Serve static files
app.use(express.static('public'));

// Registration endpoint
app.post('/register', (req, res) => {
    const { username, email, password, phone, number_of_trucks, total_revenue } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const profilePicture = req.file ? req.file.filename : null;

    const sql = `INSERT INTO users (username, email, password, phone, number_of_trucks, total_revenue, profile_picture) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [username, email, hashedPassword, phone, number_of_trucks, total_revenue, profilePicture], (err, result) => {
        if (err) {
            console.error('Error registering user:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.send('User registered successfully');
    });
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            return res.status(401).send('Invalid username or password');
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // Save user session here
            req.session.userId = user.id;
            res.redirect('/dashboard'); // Redirect to the dashboard
        } else {
            res.status(401).send('Invalid username or password');
        }
    });
});

// Serve the dashboard page with dynamic data
app.get('/dashboard', (req, res) => {
    if (req.session && req.session.userId) {
        const { userId } = req.session;

        // Fetch truck details from the database
        const truckSql = 'SELECT * FROM trucks WHERE owner_id = ?';
        db.query(truckSql, [userId], (err, trucks) => {
            if (err) {
                console.error('Error fetching trucks:', err);
                return res.status(500).send('Internal Server Error');
            }

            // Render the dashboard with truck details
            res.sendFile(path.join(__dirname, 'views', 'dashboard.html')); // Serve the dashboard HTML file
        });
    } else {
        res.redirect('/login');
    }
});

// Handle form submission for cargo details and comments
app.post('/dashboard', (req, res) => {
    const { cargo_weight, cargo_name, drop_location, start_location, comment } = req.body;
    const { userId } = req.session;

    // Insert cargo details into the database
    const cargoSql = `INSERT INTO cargo (owner_id, cargo_weight, cargo_name, drop_location, start_location) 
                      VALUES (?, ?, ?, ?, ?)`;
    db.query(cargoSql, [userId, cargo_weight, cargo_name, drop_location, start_location], (err) => {
        if (err) {
            console.error('Error inserting cargo:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Insert comment into the database
        const commentSql = `INSERT INTO comments (owner_id, comment) VALUES (?, ?)`;
        db.query(commentSql, [userId, comment], (err) => {
            if (err) {
                console.error('Error inserting comment:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.redirect('..frontend/index2.html');
        });
    });

    // Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            return res.status(401).send('Invalid username or password');
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            req.session.userId = user.id;
            res.redirect('/dashboard'); // Redirect to the dashboard
        } else {
            res.status(401).send('Invalid username or password');
        }
    });
});

// Handle form submission for cargo details and comments
app.post('/dashboard', (req, res) => {
    const { cargo_weight, cargo_name, drop_location, start_location, comment } = req.body;
    const { userId } = req.session;

    // Insert cargo details into the database
    const cargoSql = `INSERT INTO cargo (owner_id, cargo_weight, cargo_name, drop_location, start_location) 
                      VALUES (?, ?, ?, ?, ?)`;
    db.query(cargoSql, [userId, cargo_weight, cargo_name, drop_location, start_location], (err) => {
        if (err) {
            console.error('Error inserting cargo:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Insert comment into the database
        const commentSql = `INSERT INTO comments (owner_id, comment) VALUES (?, ?)`;
        db.query(commentSql, [userId, comment], (err) => {
            if (err) {
                console.error('Error inserting comment:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.redirect('/dashboard');
        });
    });
});
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});