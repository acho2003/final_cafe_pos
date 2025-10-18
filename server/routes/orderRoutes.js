const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// @route   GET /api/orders/cafe/:cafeId
// @desc    Get all orders for a specific cafe
router.get('/cafe/:cafeId', async (req, res) => {
    try {
        const orderss = await Order.find({ cafeId: req.params.cafeId }).sort({ createdAt: -1 });
        res.json(orderss);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/cafe/:cafeId/recents', async (req, res) => {
    try {
        const orders = await Order.find({ cafeId: req.params.cafeId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/orders/cafe/:cafeId/table/:tableNo
// @desc    Get active order for a table
router.get('/cafe/:cafeId/table/:tableNo', async (req, res) => {
    try {
        const order = await Order.findOne({
            cafeId: req.params.cafeId,
            tableNo: req.params.tableNo,
            status: { $nin: ['COMPLETED', 'CANCELLED'] }
        });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/orders
// @desc    Create an order
router.post('/', async (req, res) => {
    const { cafeId, tableNo, items } = req.body;
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const id = `order${Date.now()}`;
    try {
        const newOrder = new Order({ id, cafeId, tableNo, items, total, phoneNumber });
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   PUT /api/orders/:id
// @desc    Update an order
router.put('/:id', async (req, res) => {
    try {
        const updateData = { ...req.body, updatedAt: new Date() };
        if (req.body.items) {
            updateData.total = req.body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        }

        const updatedOrder = await Order.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
        if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
