import express from "express";
import { DeleteAllUser, GetAllUser, Login, register } from "../controllers/User.js";
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
const UserRouter=express.Router();
UserRouter.post('/login',asyncHandler(Login));
UserRouter.post('/User',asyncHandler(register));
UserRouter.get('/User',asyncHandler(GetAllUser));
UserRouter.delete('/User',asyncHandler(DeleteAllUser));
export default UserRouter;
