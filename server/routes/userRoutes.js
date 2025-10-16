const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cafe = require('../models/Cafe');

// @route   GET /api/users
// @desc    Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/users
// @desc    Create a user
router.post('/', async (req, res) => {
    const { name, email, password, role, cafeId } = req.body;
    const id = `user${Date.now()}`;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({ id, name, email, password, role, cafeId });
        await newUser.save();

        // Find the user again to get the object processed by toJSON transform
        const userResponse = await User.findOne({ id });

        res.status(201).json(userResponse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   PUT /api/users/:id
// @desc    Update a user
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id }).select('+password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, password, role, cafeId } = req.body;
        user.name = name ?? user.name;
        user.email = email ?? user.email;
        user.role = role ?? user.role;
        
        // Allow un-assigning cafe
        if (Object.prototype.hasOwnProperty.call(req.body, 'cafeId')) {
            user.cafeId = cafeId;
        }

        if (password) {
            user.password = password;
        }

        const updatedUser = await user.save();
        
        // The toJSON transform in the model will handle removing the password
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ id: req.params.id });
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        // If user was an admin, unlink from cafe
        if (user.role === 'CAFE_ADMIN' && user.cafeId) {
             await Cafe.findOneAndUpdate({ id: user.cafeId, adminId: user.id }, { $unset: { adminId: "" } });
        }

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;