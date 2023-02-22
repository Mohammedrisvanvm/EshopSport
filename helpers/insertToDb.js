import getDiscriminatorByValue from "mongoose/lib/helpers/discriminator/getDiscriminatorByValue.js";
import { users } from "../models/userSchema.js"

const createDocument=async (data)=>{
    console.log(data);
    const email=data.email
    const userinfo= await users.findOne({email})
    if (userinfo!=email){
    try{
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
//risvan@gmail.com

export default createDocument