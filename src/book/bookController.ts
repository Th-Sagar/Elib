import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import BookModel from "./bookModel";
import fs from "node:fs";
import { AuthRequest } from "../middlewares/authenticate";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre, description } = req.body;
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
      description,
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
    const { title, genre, description } = req.body;
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
          folder: "book-pdfs",
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
        description: description,
        coverImage: completeCoverImage || book.coverImage,
        file: completeFileName || book.file,
      },
      { new: true }
    );

    res.json(updatedBook);
  } catch (error) {
    console.error("Error updating book:", error);
    return next(createHttpError(500, "Error updating book"));
  }
};

const listBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = await BookModel.find().populate("author", "name");
    // const book = await BookModel.find().populate("author", "name email");

    //populate helps to show the related data from the user collection link in the model with the ref and the fields to show

    res.json(book);
  } catch (error) {
    return next(createHttpError(500, "Error listing books"));
  }
};

const getSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookId = req.params.bookId;
    const book = await BookModel.findOne({ _id: bookId }).populate(
      "author",
      "name"
    );
    if (!book) return next(createHttpError(404, "Book not found"));

    res.json(book);
  } catch (error) {
    return next(createHttpError(500, "Error listing books"));
  }
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookId = req.params.bookId;
    const book = await BookModel.findOne({ _id: bookId });
    if (!book) return next(createHttpError(404, "Book not found"));

    const _req = req as AuthRequest;
    if (book.author.toString() !== _req.userId) {
      return next(
        createHttpError(403, "You are not authorized to update this book")
      );
    }

    const coverFilesSplits = book.coverImage.split("/");
    const coverImagePublicId =
      coverFilesSplits.at(-2) + "/" + coverFilesSplits.at(-1)?.split(".").at(0);

    const bookFileSplits = book.file.split("/");
    const bookFilePublicId =
      bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1);
    try {
      await cloudinary.uploader.destroy(coverImagePublicId);
    } catch (error) {
      return next(createHttpError(500, "Error deleting cover image"));
    }

    try {
      await cloudinary.uploader.destroy(bookFilePublicId, {
        resource_type: "raw",
      });
    } catch (error) {
      return next(createHttpError(500, "Error deleting book file"));
    }

    await BookModel.deleteOne({ _id: bookId });

    return res.sendStatus(204).json({ id: bookId });
  } catch (error) {
    return next(createHttpError(500, "Error deleting book"));
  }
};

export { createBook, updateBook, listBook, getSingleBook, deleteBook };
