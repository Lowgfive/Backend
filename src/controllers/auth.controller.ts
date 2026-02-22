import { Request, Response } from "express";
import { registerService, loginService } from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await registerService(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginService(req.body.email, req.body.password);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};