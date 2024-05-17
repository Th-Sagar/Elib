import express from "express";
import { createBook } from "./bookController";

const bookRouter = express.Router();

bookRouter.route("/").post(createBook);

export default bookRouter;
