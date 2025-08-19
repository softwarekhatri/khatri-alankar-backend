"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.ENV = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3006,
    MONGODB_URI: process.env.MONGODB_URI || "mongodb+srv://ankitkhatri:DmH21gLy2ttyZfhJ@khatrisoftware.x33xsgo.mongodb.net/alankarv2?retryWrites=true&w=majority"
};
