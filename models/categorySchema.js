import mongoose from "mongoose";

const categorySchema=new mongoose.Schema({

    name:{
        type:String,
        required:true

    },
    list:{
        type:Boolean,
        default:true
    }
})
const subCategorySchema=new mongoose.Schema({

    name:{
        type:String,
        required:true

    },
    list:{
        type:Boolean,
        default:true
    }
})

export const categories=new mongoose.model("category",categorySchema)
export const subCategories=new mongoose.model("subCategory",subCategorySchema)
