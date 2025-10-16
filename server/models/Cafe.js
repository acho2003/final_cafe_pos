const mongoose = require('mongoose');

const CafeSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    adminId: {
        type: String,
        ref: 'User'
    }
});

CafeSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        // The 'id' field from our schema is already part of returnedObject
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});


module.exports = mongoose.model('Cafe', CafeSchema);