const express = require('express');
const mongoose = require('mongoose');
const layouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const Product = require('./models/product');
const session = require("express-session");
const flash = require("connect-flash");
const cartRoutes = require("./routes/cart");
const app = express(); // Initialize app

// Middleware
app.use(express.static('public')); // Serve static files
app.use(express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.set('view engine', 'ejs'); // Set view engine to EJS
app.use(layouts); // Use EJS layouts
app.use("/", cartRoutes); 

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
    console.log(`Connected To: ${connectionString}`);
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Routes
const prodRout = require('./routes/products'); // Import routes
const categoryRout = require('./routes/categories');
const signupRoute = require('./routes/signup');

// Apply routes
app.use(prodRout); 
app.use(categoryRout);
app.use(signupRoute);

// Middleware to protect routes
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
  res.render('admin/dashboard', { layout: 'layout/formslayout' }); // Render admin dashboard with a custom layout
});

// app.get('/', isAuthenticated, (req, res) => {
//   res.render('admin/dashboard', { layout: 'layout/formslayout' }); // Render admin dashboard with a custom layout
// });

// Start Server
app.listen(5000, () => {
  console.log('Server running at http://localhost:5000');
});
