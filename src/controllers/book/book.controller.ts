/* global Express */
//* book controller
import { Request, Response, NextFunction } from 'express';
import { AppError } from '#errors/AppError.js';
import { deleteFromCloudinary, upoadToCloudinary } from '#utils/cloudinaryStorage.js';
import type { UploadApiResponse } from 'cloudinary';
import { db } from '#db/index.js';
import { booksTable } from '#db/schema.js';
import { createBookDto, updateBookDto, bookParamsDto, UpdateBookInput } from '#dtos/book.dto.js';
import { and, eq } from 'drizzle-orm';

// create new book (upload)
export const createBookController = async (req: Request, res: Response, next: NextFunction) => {
  // parse data
  const validatedData = createBookDto.parse(req.body);

  // check already exist
  const isBookExists = await db.query.booksTable.findFirst({
    where: {
      title: validatedData.title,
      author: validatedData.author,
      pages: validatedData.pages,
    },
  });

  if (isBookExists) {
    return next(new AppError('Book already exists', 400));
  }

  // upload cover and book file in cloudinary
  // type of files
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  // accessing specific files
  const coverFile = files['cover']?.[0];
  const bookFile = files['file']?.[0];

  // acessing buffer
  const coverBuffer: Buffer | undefined = coverFile?.buffer;
  const bookBuffer: Buffer | undefined = bookFile?.buffer;

  // uploade
  const coverUploadeResponse = await upoadToCloudinary(coverBuffer, 'covers');
  const bookUploadeResponse = await upoadToCloudinary(bookBuffer, 'books');

  // return values
  const finalCoverUrl = coverUploadeResponse.secure_url;
  const finalCoverPublicId = coverUploadeResponse.public_id; // for deleteion

  const finalBookUrl = bookUploadeResponse.secure_url;
  const finalBookPublicId = bookUploadeResponse.public_id; // deletion

  // create new book in database
  const newBookArray = await db
    .insert(booksTable)
    .values({
      ...validatedData,
      ownerId: req.user!.id,
      coverUrl: finalCoverUrl,
      coverPublicId: finalCoverPublicId,
      fileUrl: finalBookUrl,
      filePublicId: finalBookPublicId,
    })
    .returning();

  // checl
  if (newBookArray.length < 1) {
    return next(new AppError('Failed to create book', 500));
  }

  const newBook = newBookArray[0];

  // send response
  res.status(201).json({
    success: true,
    message: 'Book created successfully',
    data: {
      newBook,
    },
  });
};

// get all books
export const getAllBooksController = async (_req: Request, res: Response, next: NextFunction) => {
  // get books from database
  const allBooksArray = await db.query.booksTable.findMany({
    with: {
      usersTable: true,
    },
  });

  if (allBooksArray.length === 0) {
    return next(new AppError('No books found', 404));
  }

  // send response
  res.status(200).json({
    success: true,
    message: 'Books fetched successfully',
    data: {
      allBooksArray,
    },
  });
};

// get book :id
export const getBookByIdController = async (req: Request, res: Response, next: NextFunction) => {
  // get book by id from database
  const validatedParams = bookParamsDto.parse(req.params);

  // find book
  const book = await db.query.booksTable.findFirst({
    where: {
      id: validatedParams.id,
    },
  });

  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  // send response
  res.status(200).json({
    success: true,
    message: 'Book fetched successfully',
    data: {
      book,
    },
  });
};

// delete book controller
export const deleteBookController = async (req: Request, res: Response, next: NextFunction) => {
  // validate params
  const validatedParams = bookParamsDto.parse(req.params);

  // get book
  const book = await db.query.booksTable.findFirst({
    where: {
      id: validatedParams.id,
    },
  });

  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  // check user is owner
  const userId = req.user!.id;
  const bookOwnerId = book.ownerId;

  if (userId !== bookOwnerId) {
    return next(new AppError('UnAuthorized : you are not owner of this book', 401));
  }

  // delelte from cloudinary
  await deleteFromCloudinary(book.coverPublicId as string);
  await deleteFromCloudinary(book.filePublicId as string);

  // delete from dß
  await db
    .delete(booksTable)
    .where(and(eq(booksTable.id, book.id), eq(booksTable.ownerId, book.ownerId)));

  // response
  res.status(200).json({
    success: true,
    message: 'Book deleted successfully',
  });
};

// update book controller
export const updateBookController = async (req: Request, res: Response, next: NextFunction) => {
  // id
  const validatedParams = bookParamsDto.parse(req.params);

  // get book
  const book = await db.query.booksTable.findFirst({
    where: {
      id: validatedParams.id,
    },
  });

  // check book exist or not
  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  // check user is owner
  const userId = req.user!.id;
  const bookOwnerId = book.ownerId;

  if (userId !== bookOwnerId) {
    return next(new AppError('UnAuthorized : you are not ownser of this book', 401));
  }

  // inpute parse
  const validatedTextData = updateBookDto.parse(req.body);

  // check, which data is updating
  // for text data
  let updatedData: UpdateBookInput = { ...validatedTextData };

  // for files data
  // type
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

  // for cover
  if (files?.cover && files?.cover.length > 0) {
    // uploade new
    const newCoverBuffer: Buffer = files.cover[0].buffer;
    const coverUploadResponse: UploadApiResponse = await upoadToCloudinary(
      newCoverBuffer,
      'covers'
    );

    if (book.coverPublicId) {
      // delete from cloudniary
      await deleteFromCloudinary(book.coverPublicId, 'image');
    }

    // add in to updatedData object
    updatedData.coverUrl = coverUploadResponse.secure_url;
    updatedData.coverPublicId = coverUploadResponse.public_id;
  }

  // for file
  if (files?.file && files?.file.length > 0) {
    // new buffer
    const newFileBuffer: Buffer = files.file[0].buffer;

    const fileUploadResponse: UploadApiResponse = await upoadToCloudinary(newFileBuffer, 'files');

    // delete from cloudinary
    if (book.filePublicId) {
      await deleteFromCloudinary(book.filePublicId, 'raw');
    }

    updatedData.fileUrl = fileUploadResponse.secure_url;
    updatedData.filePublicId = fileUploadResponse.public_id;
  }

  // updated data in DB
  const updatedBookArray = await db
    .update(booksTable)
    .set(updatedData)
    .where(and(eq(booksTable.id, book.id), eq(booksTable.ownerId, bookOwnerId)))
    .returning();

  //check
  if (updatedBookArray.length < 1) {
    return next(new AppError('Failed to update book', 500));
  }

  // get updated book
  const updatedBook = updatedBookArray[0];

  // send response
  res.status(200).json({
    success: true,
    message: 'Book updated successfully',
    data: {
      updatedBook,
    },
  });
};
