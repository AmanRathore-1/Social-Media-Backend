import jwt from "jsonwebtoken"

export const protect =(req,res,next)=>{
    try
   { const authHead=req.headers.authorization;
    if(!authHead || !authHead.startsWith("Bearer "))
    {
        return res.status(401).json({
            success:false,
            message:"token not found"
        });
    }

    const token=authHead.split(" ")[1];

    const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;

        // Continue to the next middleware/controller
        next();
}
    catch(error)
    {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }

}