import mongoose from "mongoose";

function dbConnect() {
    mongoose.set('strictQuery', false)
    mongoose.connect("mongodb://127.0.0.1:27017/EshopSport").then(console.log("eshop db connected  !!!")).catch((err)=>console.log(err))

    
}
export default dbConnect