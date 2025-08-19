
import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3006,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb+srv://ankitkhatri:DmH21gLy2ttyZfhJ@khatrisoftware.x33xsgo.mongodb.net/alankarv2?retryWrites=true&w=majority"
};
