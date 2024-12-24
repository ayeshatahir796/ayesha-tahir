const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Category = require("../models/Category");


// Admin Dashboard
router.get("/", (req, res) => {
    res.render("admin/index", { layout:"admin/admin_layout",title: "Admin Panel" });
});

// Product Routes
// View all products
router.get("/products", async (req, res) => {
    try {
        const products = await Product.find().populate("category");
        res.render("admin/product", { layout:"admin/admin_layout",title: "Products", products });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
});

// Add product
router.get("/products/add", async (req, res) => {
    try {
        const categories = await Category.find();
        res.render("admin/add-Product", { layout:"admin/admin_layout", title: "Add Product", categories });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
});

router.post("/products/add", async (req, res) => {
    const { name, price, description, category } = req.body;

    try {
        const newProduct = new Product({
            name,
            price,
            description,
            category
        });
        await newProduct.save();
        res.redirect("/admin/products");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
});

// Edit product
router.get("/products/edit/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("category");
        const categories = await Category.find();
        res.render("admin/editProduct", { layout:"admin/admin_layout",title: "Edit Product", product, categories });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
});

router.post("/products/edit/:id", async (req, res) => {
    const { name, price, description, category } = req.body;

    try {
        await Product.findByIdAndUpdate(req.params.id, { name, price, description, category });
        res.redirect("/admin/products");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
});

// Delete product
router.get("/products/delete/:id", async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect("/admin/products");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
});

// Category Routes
// View all categories
router.get("/categories", async (req, res) => {
    try {
        const categories = await Category.find();
        res.render("admin/categories", { layout:"admin/admin_layout",title: "Categories", categories });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
});

// Add category
router.get("/categories/add", (req, res) => {
    res.render("admin/add-Category", {layout:"admin/admin_layout", title: "Add Category" });
});

router.post("/categories/add", async (req, res) => {
    const { name } = req.body;

    try {
        const newCategory = new Category({ name });
        await newCategory.save();
        res.redirect("/admin/categories");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
});

// Edit category
router.get("/categories/edit/:id", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        res.render("admin/editCategory", {layout:"admin/admin_layout",title: "Edit Category", category });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
});

router.post("/categories/edit/:id", async (req, res) => {
    const { name } = req.body;

    try {
        await Category.findByIdAndUpdate(req.params.id, { name });
        res.redirect("/admin/categories");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
});

// Delete category
router.get("/categories/delete/:id", async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.redirect("/admin/categories");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
});

module.exports = router