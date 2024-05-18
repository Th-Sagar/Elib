import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import BookModel from "./bookModel";
import fs from "node:fs";
import { AuthRequest } from "../middlewares/authenticate";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
  const filename = files.coverImage[0].filename;
  const filePath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    filename
  );

  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: filename,
      folder: "book-covers",
      format: coverImageMimeType,
    });

    const bookFileName = files.file[0].filename;
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFileName
    );

    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "raw",
        filename_override: bookFileName,
        folder: "book-pdfs",
        format: "pdf",
      }
    );

    const _req = req as AuthRequest;

    const newBook = await BookModel.create({
      title,
      genre,
      author: _req.userId,
      coverImage: uploadResult.secure_url,
      file: bookFileUploadResult.secure_url,
    });

    await fs.promises.unlink(filePath);
    await fs.promises.unlink(bookFilePath);

    res.status(201).json({ id: newBook._id });
  } catch (error) {
    return next(createHttpError(500, "Error uploading book file"));
  }
};

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, genre } = req.body;
    const bookId = req.params.bookId;

    const book = await BookModel.findOne({ _id: bookId });
    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }

    const _req = req as AuthRequest;
    if (book.author.toString() !== _req.userId) {
      return next(
        createHttpError(403, "You are not authorized to update this book")
      );
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let completeCoverImage = "";
    let completeFileName = "";

    if (files.coverImage) {
      try {
        const filename = files.coverImage[0].filename;
        const coverMimeType = files.coverImage[0].mimetype.split("/").at(-1);
        const filePath = path.resolve(
          __dirname,
          "../../public/data/uploads",
          filename
        );
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          filename_override: filename,
          folder: "book-covers",
          format: coverMimeType,
        });

        completeCoverImage = uploadResult.secure_url;
        await fs.promises.unlink(filePath);
      } catch (error) {
        return next(createHttpError(500, "Error uploading cover image"));
      }
    }

    if (files.file) {
      try {
        const bookFilePath = path.resolve(
          __dirname,
          "../../public/data/uploads",
          files.file[0].filename
        );
        const bookFileName = files.file[0].filename;
        const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
          resource_type: "raw",
          filename_override: bookFileName,
          folder: "book-files",
          format: "pdf",
        });

        completeFileName = uploadResultPdf.secure_url;
        await fs.promises.unlink(bookFilePath);
      } catch (error) {
        return next(createHttpError(500, "Error uploading book file"));
      }
    }

    const updatedBook = await BookModel.findOneAndUpdate(
      { _id: bookId },
      {
        title: title,
        genre: genre,
        coverImage: completeCoverImage || book.coverImage,
        file: completeFileName || book.file,
      },
      { new: true }
    );

    res.json(updatedBook);
  } catch (error) {
    console.error("Error updating book:", error);
    next(createHttpError(500, "Error updating book"));
  }
};

export { createBook, updateBook };
