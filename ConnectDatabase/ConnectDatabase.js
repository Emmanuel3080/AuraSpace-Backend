const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const mongoDbUri = process.env.mongoDbKey;

const connectMongose = async () => {
  console.log("Connecting To Database..");

  try {
    const connect = await mongoose.connect(mongoDbUri);
    if (connect) {
      console.log("MongoDb Connected Sucessfully💻✅👩🏾‍💻");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectMongose;
