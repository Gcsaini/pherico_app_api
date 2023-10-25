import { Router } from "express";
import { UserById } from "../controller/userController.js";
export const route = Router();

route.get("/user-by-id", UserById);

export default route;
