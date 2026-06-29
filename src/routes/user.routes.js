import {Router} from "express";
import {Signup,login} from "../controllers/user.controller.js"
const router=Router();

router.post("/signup",Signup)
router.post("/signin",login)

export default router;