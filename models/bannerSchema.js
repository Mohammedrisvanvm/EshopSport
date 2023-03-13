import mongoose from "mongoose";
const bannerSchema=new mongoose.Schema({
    mainImage: {
        type: Array,
        required: true,
      }
})
export const bannerimage = new mongoose.model("banner", bannerSchema);