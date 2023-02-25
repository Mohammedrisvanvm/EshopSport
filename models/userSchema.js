import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  ban:{
    type: Boolean,
    default:false
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
export const users=new mongoose.model("user",userSchema)
