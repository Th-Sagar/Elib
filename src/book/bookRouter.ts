import express from "express";
import {
  createBook,
  updateBook,
  listBook,
  getSingleBook,
  deleteBook,
} from "./bookController";
import multer from "multer";
import path from "node:path";
import authenticate from "../middlewares/authenticate";

const bookRouter = express.Router();

const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),
  limits: { fileSize: 3e7 }, // 30mb 30* 1024*1024
});

bookRouter.route("/").post(
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook
);

bookRouter.route("/:bookId").patch(
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  updateBook
);

bookRouter.route("/").get(listBook);
bookRouter.route("/:bookId").get(getSingleBook);
bookRouter.route("/:bookId").delete(authenticate, deleteBook);

export default bookRouter;
