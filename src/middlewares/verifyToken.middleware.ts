import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../interface/AutheticatedRequest";
import { UserModel } from "../models/user.models";

const jwtSecret = process.env.JWT_SECRET || "";

export const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers?.authorization?.split(" ")[1];
  if (!token) {
    return res.status(400).json({
      status: false,
      message: "Access Denied",
    });
  }

  jwt.verify(token, jwtSecret, async (err, decode) => {
    if (err) {
      return res.status(401).json({ status: false, message: "Invalid token" });
    }
    if (typeof decode === "object" && "id" in decode) {
      const user = await UserModel.findById(decode.id);
      if (!user) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid Token fetch user" });
      }
      req.user = user;
      next();
    } else {
      return res
        .status(400)
        .json({ status: false, message: "Invalid token payload" });
    }
  });
};
