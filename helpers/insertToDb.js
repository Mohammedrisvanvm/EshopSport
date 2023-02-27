import getDiscriminatorByValue from "mongoose/lib/helpers/discriminator/getDiscriminatorByValue.js";
import { users } from "../models/userSchema.js"
import bcrypt from "bcrypt"

const createDocument=async (data)=>{
    console.log(data);
    const email=data.email
    const userinfo= await users.findOne({email})
    if (userinfo!=email){
    try{
        data.password=await bcrypt.hash(data.password,10)
        const userData = new users({
           
            name:data.name,
            email:data.email,
            password:data.password
        })
        await userData.save();
    }catch(err){
        console.log(err);

    }
}else{
        console.log("email matched");
    }

}


export default createDocument