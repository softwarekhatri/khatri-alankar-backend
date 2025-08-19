"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
async function connectDB() {
    const uri = env_1.ENV.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI is not set");
    }
    mongoose_1.default.set("strictQuery", true);
    await mongoose_1.default.connect(uri, {
        dbName: "alankarv2"
    });
    return mongoose_1.default.connection;
}
