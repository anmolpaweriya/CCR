"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const env_js_1 = require("./env.js");
let mongoMemoryServer = null;
const connectDB = async () => {
    try {
        let mongoUri = env_js_1.ENV.MONGODB_URI;
        if (!mongoUri) {
            console.log('⚡ No MONGODB_URI provided. Initializing in-memory MongoDB server...');
            mongoMemoryServer = await mongodb_memory_server_1.MongoMemoryServer.create();
            mongoUri = mongoMemoryServer.getUri();
            console.log(`📦 In-Memory MongoDB running at: ${mongoUri}`);
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ MongoDB connected successfully');
        mongoose_1.default.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });
    }
    catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    try {
        await mongoose_1.default.disconnect();
        if (mongoMemoryServer) {
            await mongoMemoryServer.stop();
            console.log('🛑 In-Memory MongoDB stopped');
        }
    }
    catch (error) {
        console.error('❌ Error disconnecting MongoDB:', error);
    }
};
exports.disconnectDB = disconnectDB;
