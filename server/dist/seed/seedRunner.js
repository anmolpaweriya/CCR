"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_js_1 = require("../config/db.js");
const seedData_js_1 = require("./seedData.js");
const run = async () => {
    try {
        await (0, db_js_1.connectDB)();
        await (0, seedData_js_1.seedDatabase)();
        console.log('Seeding completed successfully');
        await (0, db_js_1.disconnectDB)();
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};
run();
