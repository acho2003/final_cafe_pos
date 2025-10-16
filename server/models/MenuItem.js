const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    cafeId: { type: String, required: true, ref: 'Cafe' },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String }
});

MenuItemSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);