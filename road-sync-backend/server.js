require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Connection error:', err));

// Define schema and model
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    companyName: String,
    companyType: String,
    numberOfTrucks: Number,
    monthlyRevenue: Number,
    companyLocation: String
});

const User = mongoose.model('User', userSchema);

// Register route
app.post('/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(400).send('Error registering user');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});