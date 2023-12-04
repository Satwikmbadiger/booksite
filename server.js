// server.js (Node.js server-side code)

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://booksite:booksite@cluster0.a6mtlte.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Create a Book schema
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
});

// Add a unique index on the title and author fields
bookSchema.index({ title: 1, author: 1 }, { unique: true });

// Create a Book model
const Book = mongoose.model('Book', bookSchema);

// Route to serve the index.html page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Route to serve the books.html page
app.get('/books', (req, res) => {
    res.sendFile(__dirname + '/public/books.html');
});

// Route to handle book addition
app.post('/add-book', async (req, res) => {
    const { title, author, description, price } = req.body;
    try {
        // Insert data into the database
        const newBook = await Book.create({ title, author, description, price });
        console.log('Book added successfully:');
        res.status(200).json({ message: 'Book added successfully', book: newBook });
    } catch (err) {
        if (err.code === 11000 || err.code === 11001) {
            // Duplicate key error
            console.error('Error adding book:', err.message);
            res.status(400).json({ error: 'Duplicate book entry. The book already exists.' });
        } else {
            // Other errors
            console.error('Error adding book:', err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

// Route to get the list of books
app.get('/books-list', async (req, res) => {
    try {
        const books = await Book.find({});
        res.status(200).json({ books });
    } catch (error) {
        console.error('Error fetching books:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
