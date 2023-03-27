import mongoose from "mongoose";
const bannerSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  list: {
    type: Boolean,
    default: false,
  },
  mainImage: {
    type: Array,
    required: true,
  },
});
export const bannerModel = new mongoose.model("banner", bannerSchema);
