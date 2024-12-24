const express = require('express');
const mongoose = require('mongoose');
const layouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const Product = require('./models/product');
const Cart = require('./models/cart');
const session = require("express-session");
const flash = require("connect-flash");

const path = require('path');


const app = express(); // Initialize app
app.set('views', path.join(__dirname, 'views'));


// Middleware
app.use(express.static('public')); // Serve static files
app.use(express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.set('view engine', 'ejs'); // Set view engine to EJS
app.use(layouts); // Use EJS layouts

// Session setup
app.use(
  session({
    secret: "devSecretKey123456789",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(flash());

// Connect to MongoDB
let connectionString = 'mongodb://localhost:27017/panel';
mongoose
  .connect(connectionString)
  .then(() => {
    console.log(Connected To: ${connectionString});
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Routes
const prodRout = require('./routes/products'); 
const categoryRout = require('./routes/categories');
const signupRoute = require('./routes/signup');


// Apply routes
app.use(prodRout); 
app.use(categoryRout);
app.use(signupRoute);


function isAuthenticated(req, res, next) {

  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
}


// Home Route
app.get('/home', isAuthenticated, async (req, res) => {
  let product = await Product.find();
  res.render('index', { product }); // Render index.ejs
});

// Admin Route
app.get('/admin', isAuthenticated, (req, res) => {
  res.render('admin/dashboard', {
    layout: 'layout/formslayout',
    messages: req.flash() // Ensure messages are passed correctly
  });
});

// Start Server
app.listen(5000, () => {
  console.log('Server running at http://localhost:5000');
});

// Add to Cart Route
app.post('/cart/add', isAuthenticated, async (req, res) => {
  const { productId } = req.body;

  // Validate product
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).send('Product not found');
  }

  // Check if the user has an existing cart
  let cart = await Cart.findOne();
  if (!cart) {
    // Create a new cart if none exists
    cart = new Cart({ userId: req.session.user._id, items: [] });
  }

  // Check if product already exists in the cart
  const existingItem = cart.items.find((item) => item.productId.equals(productId));
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({ productId, quantity: 1 });
  }

  // Save the cart
  await cart.save();

  // Pass the success message and render the index page (home page)
  res.render('index', {
    message: 'Product added to cart successfully!',
    product: await Product.find(),  // Make sure to pass the product data again
  });
});



// Display Cart Route
app.get('/cart', isAuthenticated, async (req, res) => {
  const cart = await Cart.findOne().populate('items.productId');

  
  if (!cart) {
    return res.render('admin/cart', { cart: [], totalPrice: 0, layout: 'layout/formslayout' });
  }

  // Calculate total price
  const totalPrice = cart.items.reduce((total, item) => total + item.productId.price * item.quantity, 0);

  res.render('admin/cart', { 
    cart: cart.items.map((item) => ({
      product: item.productId,
      quantity: item.quantity,
    })), 
    totalPrice, 
    layout: 'layout/formslayout' 
  });
});

// Delete
app.post('/cart/delete', isAuthenticated, async (req, res) => {
  const { productId } = req.body;

  // Find the user's cart
  const cart = await Cart.findOne();

  if (!cart) {
      return res.redirect('/cart');
  }

  // Filter out the item to be deleted
  cart.items = cart.items.filter((item) => !item.productId.equals(productId));

  // Save the updated cart
  await cart.save();

  // Redirect back to the cart page
  res.redirect('/cart');
});

// Route to handle checkout
app.post('/cart/checkout', isAuthenticated, async (req, res) => {
  const cart = await Cart.findOne({}).populate('items.productId');

  if (!cart || cart.items.length === 0) {
      return res.redirect('/cart'); // Redirect back if the cart is empty
  }

  // Process the checkout (you can save the order to the database, etc.)
  // Example: Save order to the database, or process payment here

  // Optionally, clear the cart after checkout
  await Cart.deleteOne( );

  // Redirect to a confirmation page or the payment page
  res.redirect('/checkout/confirmation');
});

// Confirmation page route
app.get('/checkout/confirmation', isAuthenticated, (req, res) => {
  res.render('admin/checkout', {
      layout: 'layout/formslayout',
      message: 'Your order has been placed successfully!',
  });
});


app.post('/cart/update', isAuthenticated, async (req, res) => {
  const { productId, action } = req.body;

  // Fetch the user's cart from the database
  const cart = await Cart.findOne({ userId: req.session.user._id }).populate('items.productId');

  if (!cart) {
    return res.status(404).send('Cart not found');
  }

  const cartItem = cart.items.find((item) => item.productId._id.toString() === productId);

  if (cartItem) {
    if (action === 'increase') {
      cartItem.quantity += 1;
    } else if (action === 'decrease' && cartItem.quantity > 1) {
      cartItem.quantity -= 1;
    }

    // Save the updated cart
    await cart.save();

    // Recalculate total price if needed
    const totalPrice = cart.items.reduce((acc, item) => acc + item.productId.price * item.quantity, 0);
    
    // Optionally, store total price in session
    req.session.totalPrice = totalPrice;

    return res.redirect('/cart');
  }

  res.status(400).send('Invalid product or action.');
});