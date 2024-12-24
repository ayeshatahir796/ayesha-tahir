const express = require('express');
const multer = require("multer");
const router = express.Router();
const Product = require('../models/product');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads"); // Directory to store files
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique file name
    },
});
const upload = multer({ storage: storage });

// Render Create Product Form
router.get('/products/create', async (req, res) => {
    res.render('admin/products/create', { layout: "layout/formslayout" });
});

// Handle Create Product Request
router.post("/products/create", upload.single("file"), async (req, res) => {
    const pro = new Product({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        picture: req.file ? req.file.filename : null,
    });
    await pro.save();
    res.redirect("/products");
});

// Edit Product Form
router.get('/products/edit/:id', async (req, res) => {
    const pro = await Product.findById(req.params.id);
    res.render("admin/products/editProduct", { pro, layout: "layout/formslayout" });
});

router.post('/products/edit/:id', upload.single("file"), async (req, res) => {
    try {
        const updatedData = {
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
        };

        // If a new file is uploaded, add the picture field
        if (req.file) {
            updatedData.picture = req.file.filename;
        }

        // Update the product with the new data
        await Product.findByIdAndUpdate(req.params.id, updatedData);

        res.redirect('/products');
    } catch (err) {
        res.status(500).send("Error updating the product: " + err.message);
    }
});


// Delete Product
router.get("/products/delete/:id", async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("back");
});

// Pagination for Products (optional, based on your URL structure)
router.get("/products/:page?", async (req, res) => {
    try {
        let page = req.query.page ? Number(req.query.page) : 1; // Current page
        let pageSize = 5; // Number of products per page
        let searchQuery = req.query.search || "";  // Search query input

        // Build search filter (search in 'name', 'description', and 'price')
        let filter = {};
        if (searchQuery) {
            filter.$or = [];

            // Apply word boundary search for whole words (case-insensitive)
            filter.$or.push(
                { name: { $regex: `\\b${searchQuery}\\b`, $options: "i" } },
                { description: { $regex: `\\b${searchQuery}\\b`, $options: "i" } }
            );

            // Apply substring search for matching substrings anywhere in the name/description (case-insensitive)
            filter.$or.push(
                { name: { $regex: searchQuery, $options: "i" } },
                { description: { $regex: searchQuery, $options: "i" } }
            );

            // Handle price as a numeric value (exact match for numeric queries)
            if (!isNaN(searchQuery)) {
                filter.$or.push(
                    { price: Number(searchQuery) }
                );
            }
        }
       
        // Fetch products matching the filter with pagination
        let products = await Product.find(filter)
            .limit(pageSize)
            .skip((page - 1) * pageSize);

        // Get total count of filtered products
        let totalRecords = await Product.countDocuments(filter);
        let totalPages = Math.ceil(totalRecords / pageSize);

        // Render the products page
        return res.render('admin/products/products', {
            products,                 // List of products
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
            },
            searchQuery,              // Pass search input back to the form
            layout: "layout/formslayout",
        });
    } catch (error) {
        console.error("Error fetching products:", error.message);
        return res.status(500).send("Error fetching products.");
    }
});

// Render List of Products with Pagination and Search
router.get('/products', async (req, res) => {
    try {
        let page = req.query.page ? Number(req.query.page) : 1; // Current page
        let pageSize = 5; // Number of products per page
        let searchQuery = req.query.search || "";  // Search query input

        /// Build search filter (search in 'name', 'description', and 'price')
        let filter = {};
        if (searchQuery) {
            filter.$or = [];

            // Apply word boundary search for whole words (case-insensitive)
            filter.$or.push(
                { name: { $regex: `\\b${searchQuery}\\b`, $options: "i" } },
                { description: { $regex: `\\b${searchQuery}\\b`, $options: "i" } }
            );

            // Apply substring search for matching substrings anywhere in the name/description (case-insensitive)
            filter.$or.push(
                { name: { $regex: searchQuery, $options: "i" } },
                { description: { $regex: searchQuery, $options: "i" } }
            );

            // Handle price as a numeric value (exact match for numeric queries)
            if (!isNaN(searchQuery)) {
                filter.$or.push(
                    { price: Number(searchQuery) }
                );
            }
        }

        // Fetch products matching the filter with pagination
        let products = await Product.find(filter)
            .limit(pageSize)
            .skip((page - 1) * pageSize);

        // Get total count of filtered products
        let totalRecords = await Product.countDocuments(filter);
        let totalPages = Math.ceil(totalRecords / pageSize);

        // Render the products page
        return res.render('admin/products/products', {
            products,                 // List of products
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
            },
            searchQuery,              // Pass search input back to the form
            layout: "layout/formslayout",
        });
    } catch (error) {
        console.error("Error fetching products:", error.message);
        return res.status(500).send("Error fetching products.");
    }
});

module.exports = router;
