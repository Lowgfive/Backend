import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const authRoute = Router();

authRoute.post("/register", register);
authRoute.post("/login", login);
authRoute.get("/profile", authenticate, (req, res) => {
  res.json({ message: "Protected route", user: (req as any).user });
});
export default authRoute;