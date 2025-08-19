import mongoose from "mongoose";
import { ENV } from "./env";

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  const uri = ENV.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    dbName: "alankarv2",
    maxPoolSize: 3, // control number of concurrent sockets
  } as any);

  isConnected = true;
  return mongoose.connection;
}