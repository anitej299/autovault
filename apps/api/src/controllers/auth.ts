import type { RequestHandler } from "express";
import * as schemas from "../validators/auth.js";
import * as service from "../services/auth.js";
export const register: RequestHandler = async (req, res) => {
  const input = schemas.registration.parse(req.body);
  res.status(201).json(await service.register(input.email, input.password));
};
export const login: RequestHandler = async (req, res) => {
  const input = schemas.login.parse(req.body);
  res.json(await service.authenticate(input.email, input.password));
};
