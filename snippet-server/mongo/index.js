const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURL = process.env.MONGO_URI;
    if (!mongoURL) throw new Error("MONGO_URI is not set");

    await mongoose.connect(mongoURL);
    console.log("Connected to Mongo DB");
  } catch (error) {
    console.error("Mongo connection error:", error.message || error);
  }
};

module.exports = { connectDB };