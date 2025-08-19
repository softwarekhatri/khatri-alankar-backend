
import mongoose from "mongoose";
import { ENV } from "./env";

export async function connectDB() {
  const uri = ENV.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    dbName: "alankarv2"
  } as any);
  return mongoose.connection;
}
