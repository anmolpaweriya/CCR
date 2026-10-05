"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_js_1 = require("./config/env.js");
const db_js_1 = require("./config/db.js");
const index_js_1 = __importDefault(require("./routes/index.js"));
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const User_js_1 = require("./models/User.js");
const seedData_js_1 = require("./seed/seedData.js");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: [env_js_1.ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'CCR API',
        timestamp: new Date().toISOString(),
        demoMode: env_js_1.ENV.DEMO_PAYMENT_MODE,
    });
});
// API Routes
app.use('/api', index_js_1.default);
// Global Error Handler
app.use(errorHandler_js_1.errorHandler);
// Start server
const start = async () => {
    await (0, db_js_1.connectDB)();
    // Auto-seed if database is empty
    const userCount = await User_js_1.User.countDocuments();
    if (userCount === 0) {
        console.log('⚡ Empty database detected. Auto-seeding initial community data...');
        await (0, seedData_js_1.seedDatabase)();
    }
    app.listen(env_js_1.ENV.PORT, () => {
        console.log(`🚀 CCR Server running on port ${env_js_1.ENV.PORT}`);
        console.log(`🔗 API Base: http://localhost:${env_js_1.ENV.PORT}/api`);
        console.log(`💚 Community Economy: Cash & Goodwill Credits Active`);
    });
};
start();
