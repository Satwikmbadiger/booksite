const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Multer storage configuration
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const url = 'mongodb+srv://booksite:booksite@cluster0.a6mtlte.mongodb.net/bookmarketplace';

// MongoDB connection
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

// Import models
const User = require('./models/user');
const Book = require('./models/book');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static('views'));
app.use(express.static('/public/images'));
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

// Middleware to check user authentication
const requireLogin = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Routes

app.get('/genre', (req, res) => {
  res.render('genre');  // Assuming your home.ejs file is in the 'views' directory
});

// Home route to display home.ejs
app.get('/', (req, res) => {
  res.render('home');  // Assuming your home.ejs file is in the 'views' directory
});

// thrift route
app.get('/thrift', requireLogin, async (req, res) => {
  const books = await Book.find();
  res.render('thrift', { books });
});

// Login routes
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.userId = user._id;
      console.log('Login successful');
      res.redirect('/thrift');
    } else {
      console.log('Invalid email or password');
      res.redirect('/login');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Sell route
app.get('/sell', requireLogin, (req, res) => {
  res.render('sell');
});

app.post('/sell', requireLogin, upload.single('image'), async (req, res) => {
  const { title, author, price } = req.body;
  const image = req.file.filename;
  const book = new Book({ title, author, price, seller: req.session.userId, image });

  try {
    await book.save();
    res.redirect('/');
  } catch (error) {
    console.error('Error saving book:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Dashboard route
app.get('/dashboard', requireLogin, async (req, res) => {
  const userId = req.session.userId;

  try {
    const userBooks = await Book.find({ seller: userId });
    res.render('dashboard', { userBooks });
  } catch (error) {
    console.error('Error fetching user books:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Delete item from dashboard route
app.delete('/delete/:bookId', requireLogin, async (req, res) => {
  const userId = req.session.userId;
  const bookIdToDelete = req.params.bookId;

  try {
    // Check if bookIdToDelete is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(bookIdToDelete)) {
      console.error('Invalid book ID format.');
      return res.status(400).send('Bad Request');
    }

    const user = await User.findById(userId);

    if (!user) {
      console.error('User not found.');
      return res.status(500).send('Internal Server Error');
    }

    // Delete the book from the database
    const deletedBook = await Book.findByIdAndDelete(bookIdToDelete);

    if (!deletedBook) {
      console.error('Book not found.');
      return res.status(500).send('Internal Server Error');
    }

    // Remove the book from the user's list of books
    userBooks = userBooks.filter(book => book._id.toString() !== bookIdToDelete);

    // Save the updated user without the deleted book
    await user.save();

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Cart route
app.get('/cart', requireLogin, async (req, res) => {
  const userId = req.session.userId;

  try {
    const user = await User.findById(userId).populate('cart.items.book');

    // Ensure that user.cart is defined before accessing items property
    const cartItems = user.cart ? user.cart.items : [];

    res.render('cart', { cartItems });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Add to cart route
app.post('/add-to-cart/:bookId', requireLogin, async (req, res) => {
  const userId = req.session.userId;
  const bookId = req.params.bookId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      console.error('User not found.');
      return res.status(500).send('Internal Server Error');
    }

    // Ensure user.cart is initialized
    if (!user.cart) {
      user.cart = { items: [] };
    }

    // Check if the book is already in the cart
    const existingCartItem = user.cart.items.find(item => item.book.toString() === bookId);

    if (existingCartItem) {
      // If the book is already in the cart, increase the quantity
      existingCartItem.quantity += 1;
    } else {
      // If the book is not in the cart, add it
      user.cart.items.push({ book: bookId, quantity: 1 });
    }

    // Save the updated user with the modified cart
    await user.save();

    res.redirect('/cart');
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Delete item from cart route
app.post('/delete-item/:bookId', requireLogin, async (req, res) => {
  const userId = req.session.userId;
  const bookIdToDelete = req.params.bookId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      console.error('User not found.');
      return res.status(500).send('Internal Server Error');
    }

    // Find the item in the cart
    const cartItem = user.cart.items.find(item => item.book.toString() === bookIdToDelete);

    if (!cartItem) {
      console.error('Cart item not found.');
      return res.status(500).send('Internal Server Error');
    }

    // If the quantity is more than 1, decrease the quantity
    if (cartItem.quantity != 0) {
      user.cart.items = user.cart.items.filter(item => item.book.toString() !== bookIdToDelete);
    }

    // Save the updated user with the modified cart
    await user.save();

    res.redirect('/cart');
  } catch (error) {
    console.error('Error deleting cart item:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Reduce quantity route
app.post('/reduce-quantity/:bookId', requireLogin, async (req, res) => {
  const userId = req.session.userId;
  const bookIdToReduce = req.params.bookId;
  const bookIdToDelete = req.params.bookId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      console.error('User not found.');
      return res.status(500).send('Internal Server Error');
    }

    // Find the item in the cart
    const cartItem = user.cart.items.find(item => item.book.toString() === bookIdToReduce);

    if (!cartItem) {
      console.error('Cart item not found.');
      return res.status(500).send('Internal Server Error');
    }

    // If the quantity is more than 1, decrease the quantity
    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
    } else if (cartItem.quantity != 0) {
      // If the quantity is 1, remove the item from the cart
      user.cart.items = user.cart.items.filter(item => item.book.toString() !== bookIdToDelete);
    }

    // Save the updated user with the modified cart
    await user.save();

    res.redirect('/cart');
  } catch (error) {
    console.error('Error reducing quantity:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Add quantity route
app.post('/add-quantity/:bookId', requireLogin, async (req, res) => {
  const userId = req.session.userId;
  const bookIdToReduce = req.params.bookId;
  const bookIdToDelete = req.params.bookId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      console.error('User not found.');
      return res.status(500).send('Internal Server Error');
    }

    // Find the item in the cart
    const cartItem = user.cart.items.find(item => item.book.toString() === bookIdToReduce);

    if (!cartItem) {
      console.error('Cart item not found.');
      return res.status(500).send('Internal Server Error');
    }

    // If the quantity is more than 1, increase the quantity
    if (cartItem.quantity >= 1) {
      cartItem.quantity += 1;
    }

    // Save the updated user with the modified cart
    await user.save();

    res.redirect('/cart');
  } catch (error) {
    console.error('Error Adding quantity:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Signup routes
app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.error('User already exists.');
    res.redirect('/signup');
    return;
  }

  // Create a new user
  const newUser = new User({ email, password });

  try {
    await newUser.save();
    // Log in the new user
    req.session.userId = newUser._id;
    res.redirect('/');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
