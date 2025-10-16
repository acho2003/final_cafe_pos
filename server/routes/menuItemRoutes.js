const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// @route   GET /api/menu-items/cafe/:cafeId
// @desc    Get all menu items for a specific cafe
router.get('/cafe/:cafeId', async (req, res) => {
    try {
        const menuItems = await MenuItem.find({ cafeId: req.params.cafeId });
        res.json(menuItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/menu-items
// @desc    Create a menu item
router.post('/', async (req, res) => {
    const { cafeId, name, description, price, category, imageUrl } = req.body;
    const id = `menu${Date.now()}`;
    try {
        const newMenuItem = new MenuItem({ id, cafeId, name, description, price, category, imageUrl });
        const savedMenuItem = await newMenuItem.save();
        res.status(201).json(savedMenuItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   PUT /api/menu-items/:id
// @desc    Update a menu item
router.put('/:id', async (req, res) => {
    try {
        const updatedMenuItem = await MenuItem.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!updatedMenuItem) return res.status(404).json({ message: 'Menu item not found' });
        res.json(updatedMenuItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   DELETE /api/menu-items/:id
// @desc    Delete a menu item
router.delete('/:id', async (req, res) => {
    try {
        const deletedMenuItem = await MenuItem.findOneAndDelete({ id: req.params.id });
        if (!deletedMenuItem) return res.status(404).json({ message: 'Menu item not found' });
        res.json({ message: 'Menu item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
