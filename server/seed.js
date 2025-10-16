require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Cafe = require('./models/Cafe');
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const { MOCK_CAFES, MOCK_USERS, MOCK_MENU_ITEMS, MOCK_ORDERS } = require('./seedData.js');

connectDB();

const importData = async () => {
    try {
        // Clear existing data
        await Order.deleteMany();
        await MenuItem.deleteMany();
        await User.deleteMany();
        await Cafe.deleteMany();

        // Insert new data
        await Cafe.insertMany(MOCK_CAFES);
        
        // Create users individually to ensure password hashing middleware is triggered
        for (const user of MOCK_USERS) {
            await User.create(user);
        }

        await MenuItem.insertMany(MOCK_MENU_ITEMS);
        await Order.insertMany(MOCK_ORDERS);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Order.deleteMany();
        await MenuItem.deleteMany();
        await User.deleteMany();
        await Cafe.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}