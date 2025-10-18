const express = require('express');
const router = express.Router();
const Cafe = require('../models/Cafe');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

// @route   GET /api/cafes
// @desc    Get all cafes
router.get('/', async (req, res) => {
    try {
        const cafes = await Cafe.find();
        res.json(cafes); // res.json() will automatically use the toJSON transform from the model
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:cafeId/recent', async (req, res) => {
    const { cafeId } = req.params;

    // Calculate the time 2 hours ago
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    try {
        const cafes = await Cafe.find({
            cafeId: cafeId,               // same cafeId
            createdAt: { $gte: twoHoursAgo } // created within last 2 hours
        });

        res.json(cafes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// @route   POST /api/cafes
// @desc    Create a cafe
router.post('/', async (req, res) => {
    const { name, location, adminId } = req.body;
    const id = `cafe${Date.now()}`;
    try {
        const newCafe = new Cafe({ id, name, location, adminId });
        const savedCafe = await newCafe.save();
        res.status(201).json(savedCafe);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   PUT /api/cafes/:id
// @desc    Update a cafe
router.put('/:id', async (req, res) => {
    try {
        // FIX: Use findOneAndUpdate with the custom 'id' field to prevent server crash
        const updatedCafe = await Cafe.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!updatedCafe) return res.status(404).json({ message: 'Cafe not found' });
        res.json(updatedCafe);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   DELETE /api/cafes/:id
// @desc    Delete a cafe and its related data
router.delete('/:id', async (req, res) => {
    try {
        const cafeIdToDelete = req.params.id;
        
        // Find and delete the cafe
        const deletedCafe = await Cafe.findOneAndDelete({ id: cafeIdToDelete });
        if (!deletedCafe) {
            return res.status(404).json({ message: 'Cafe not found' });
        }

        // Cascade delete: remove associated data
        await MenuItem.deleteMany({ cafeId: cafeIdToDelete });
        await Order.deleteMany({ cafeId: cafeIdToDelete });

        // Unlink users associated with this cafe
        await User.updateMany({ cafeId: cafeIdToDelete }, { $unset: { cafeId: "" } });

        res.status(204).send(); // Send 204 No Content on successful deletion
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;