import mongoose from "mongoose"

export const connectDb=async ()=>{
    try{
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${mongoose.connection.name}`);
    }catch(error)
    {
      console.log("Mongo db connection failed",error.message);
      process.exit(1);
    }
    
}