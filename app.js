import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { connectDb } from "./src/config/db.js";
import router from "./src/routes/user.routes.js";
dotenv.config();
const app=express();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

const PORT=process.env.PORT || 3000;
app.get("/",(req,res)=>{
    res.send("Social Media Backend API is Running ")
})
app.use("/api/users",router);
await connectDb();
app.listen(PORT,()=>{
    console.log(`Server listening on port ${PORT}`);
})