import User from "../models/user.model.js";
import bcrypt from "bcrypt"
export const Signup=async (req,res)=>{
    try
    {
    const {name,email,password}=req.body;

    if(!name || !email || !password)
    {
        return res.status(400).json({
            success:false,
            message:"Data missing"
        })
    }

    const usermail=await User.findOne({email});

    if(usermail)
    {
        return res.status(400).json({
            success:false,
            message:"User already exists"
        })
    }
    const hashedPassword=await bcrypt.hash(password,10);
    const user=await User.create({name,email,password:hashedPassword});

    res.status(201).json({
        success:true,
        message:"user created",
        details:user
    });
}
    catch(error)
    {
res.status(500).json({
        success:false,
        message:error.message,
    })
    }
}


export const login=async (req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password)
    {
        return res.status(404).json({
            success:false,
            message:"Data missing"
        })
    }

    const user=await User.findOne({email}).select("+password");

    if(!user)
    {
        return  res.status(400).json({
            success:false,
            message:"no user found with the mail"
        })
    }

   const isPasswordMatch = await bcrypt.compare(password, user.password);
   if(!isPasswordMatch)
   {
    return res.status(401).json({
            success:false,
            message:"Password invalid"
        })
   }

   res.status(200).json({
     success:true,
     message:"login successfull",
     data:user
   })
    }catch(error)
    {
        res.status(500).json({
            success:false,
           message: error.message
        })
    }
}