import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import User from "./userModel";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    const error = createHttpError(
      400,
      "Please provide all the required fields"
    );
    return next(error);
  }

  const user = await User.findOne({ email });
  if (user) {
    const error = createHttpError(400, "User already exists with this email");
    return next(error);
  }

  res.json({ message: "User created successfully" });
};

export { createUser };
