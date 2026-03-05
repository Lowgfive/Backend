import { Request, Response } from "express";
import { registerService, loginService } from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  const user = await registerService(req.body);
  res.status(201).json(user);
};

export const login = async (req: Request, res: Response) => {
  const result = await loginService(req.body.email, req.body.password);
  res.status(200).json(result);
};
