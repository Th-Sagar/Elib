import { NextFunction, Request, Response } from "express";

const createBook = (req: Request, res: Response, next: NextFunction) => {
  const {} = req.body;
  res.json({ message: "Book created successfully" });
};

export { createBook };
