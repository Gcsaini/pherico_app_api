import { Router } from "express";
import { UserById } from "../controller/userController.js";
import { UploadCateogry } from "../controller/categoryController.js";
export const route = Router();

route.get("/user-by-id", UserById);

route.post("/post-category", UploadCateogry);

export default route;
