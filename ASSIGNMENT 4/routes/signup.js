const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("connect-flash");
const User = require("../models/users");
const router = express.Router();

// Render login form
router.get("/login", (req, res) => {
  // Pass flash messages to the view
  res.render("admin/login", { messages: req.flash() });
});
router.get("/", (req, res) => {
  // Pass flash messages to the view
  res.render("admin/login", { messages: req.flash() });
});

// Handle login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");  // Redirect back to the login form with an error message
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");  // Redirect back to the login form with an error message
    }

    // Save user info in session
    req.session.user = user;
    res.redirect("/admin"); // Redirect to the admin dashboard after login
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("An error occurred during login.");
  }
});

// Render signup form
router.get("/signup", (req, res) => {
  res.render("admin/signup", { messages: req.flash() });
});

// Handle signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/signup");  // Redirect back with the error message
    }

    // Check if user already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      req.flash("error", "User already exists");
      return res.redirect("/signup");  // Redirect back with the error message
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const user = new User({ ...req.body, password: hashedPassword });
    await user.save();

    req.flash("success", "Account created successfully! Please log in.");
    res.redirect("/login");  // Redirect to the login page after successful signup
  } catch (error) {
    console.error("Error during signup:", error);
    req.flash("error", "An error occurred during signup.");
    res.redirect("/signup");  // Redirect back with the error message
  }
});

// Handle logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error logging out.");
    }
    res.redirect("/login");  // Redirect to login page after logout
  });
});

module.exports = router;
