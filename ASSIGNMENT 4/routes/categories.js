const express = require('express');
const router = express.Router();
const Category = require('../models/category');

// Category CRUD

// Create - Render category creation form
router.get('/categories/create', async (req, res) => {
    res.render('admin/categories/create', { layout: "layout/formslayout" });
});

// Create - Handle category form submission
router.post('/categories/create', async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.redirect('/categories'); // This redirects to the category list
    } catch (err) {
        res.status(500).send('Error creating the category');
    }
});

// Read - Show all categories
router.get('/categories', async (req, res) => {
    try {
        let page = req.query.page ? Number(req.query.page) : 1; // Current page
        let pageSize = 2; // Number of products per page

        // Fetch products for the current page
        let categories = await Category.find()
            .limit(pageSize)
            .skip((page - 1) * pageSize);

        // Get total number of products to calculate total pages
        let totalRecords = await Category.countDocuments();
        let totalPages = Math.ceil(totalRecords / pageSize);

        // Define pagination object
        let pagination = {
            currentPage: page,
            totalPages: totalPages,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
        };

        // Pass pagination to the template
        res.render('admin/categories/categories', {
            categories,
            pagination, // Send pagination object
            layout: "layout/formslayout"
        });
    }
    catch (err) {
        res.status(500).send('Error retrieving categories');
    }
});

// Edit - Render category edit form
router.get('/categories/edit/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        res.render('admin/categories/edit', { category, layout: "layout/formslayout" });
    } catch (err) {
        res.status(500).send('Error loading category edit form');
    }
});

// Update - Handle category update form submission
router.post('/categories/edit/:id', async (req, res) => {
    try {
        await Category.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/categories');
    } catch (err) {
        res.status(500).send('Error updating the category');
    }
});

// Delete - Handle category deletion
router.get('/categories/delete/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.redirect('back');
    } catch (err) {
        res.status(500).send('Error deleting the category');
    }
});

// Pagination for Products (optional, based on your URL structure)
router.get("/categories/:page?", async (req, res) => {
    let page = req.params.page ? Number(req.params.page) : 1; // Current page
    let pageSize = 2; // Items per page

    // Fetch products for the current page
    let categories = await Category.find()
        .limit(pageSize)
        .skip((page - 1) * pageSize);

    // Get total records to calculate total pages
    let totalRecords = await Category.countDocuments();
    let totalPages = Math.ceil(totalRecords / pageSize);

    // Define pagination object
    let pagination = {
        currentPage: page,
        totalPages: totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
    };

    // Render template with products and pagination data
    res.render("admin/categories/categories", {
        categories,
        pagination, // Pass pagination object
    });
});

module.exports = router;
