const express = require("express");
const session = require("express-session");
const router = express.Router();
const Product = require("../models/product"); // Adjust the path to your Product model

// Add to Cart Route (POST)
router.post('/cart/add', async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required.' });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Initialize cart if not already
        if (!req.session.cart) {
            req.session.cart = [];
        }

        // Check if product already in cart
        const existingProductIndex = req.session.cart.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (existingProductIndex >= 0) {
            // If already in cart, update quantity
            req.session.cart[existingProductIndex].quantity += 1;
        } else {
            // If not in cart, add product
            req.session.cart.push({
                productId: product._id,
                quantity: 1,
            });
        }

        res.status(200).json({ message: 'Product added to cart successfully.' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Error adding product to cart.' });
    }
});

// View Cart Route (GET)
router.get('/cart', async (req, res) => {
    try {
        if (!req.session.cart || req.session.cart.length === 0) {
            return res.render('admin/cart/cart', { cart: [], message: 'Your cart is empty' });
        }

        // Fetch product details for each item in the cart
        const cartItems = await Promise.all(
            req.session.cart.map(async (item) => {
                const product = await Product.findById(item.productId);
                return { product, quantity: item.quantity };
            })
        );

        res.render('cart', { cart: cartItems });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).send('Error fetching cart.');
    }
});

// Remove from Cart Route (POST)
router.post('/cart/remove', async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required.' });
        }

        req.session.cart = req.session.cart.filter(
            (item) => item.productId.toString() !== productId
        );

        res.status(200).json({ message: 'Product removed from cart successfully.' });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ message: 'Error removing product from cart.' });
    }
});

module.exports = router;
