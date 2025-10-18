const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    notes: { type: String },
    phoneNumber: { type: String, required: true }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    cafeId: { type: String, required: true, ref: 'Cafe' },
    tableNo: { type: Number, required: true },
    items: [OrderItemSchema],
    total: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'REFUNDED'],
        default: 'PENDING'
    },
    paymentMethod: {
        type: String,
        enum: ['NONE', 'CASH', 'DK', 'MPAY', 'MBOB'],
        default: 'NONE'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});


OrderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

OrderSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model('Order', OrderSchema);