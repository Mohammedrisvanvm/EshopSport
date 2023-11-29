import mongoose from "mongoose";

async function dbConnect() {
  mongoose.set('strictQuery', false);

  try {
    await mongoose.connect(process.env.MONGOOSE_CONNECTLOCAL);
    console.log("eshop db connected !!!");
  } catch (err) {
    console.error(err);
  }
}

export default dbConnect;
