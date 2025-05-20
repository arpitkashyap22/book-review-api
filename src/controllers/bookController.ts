import { Request, Response, NextFunction } from 'express';
import prisma from '../db/prismaClient';
import { AppError } from '../utils/appError';
import { BookInput } from '../types';

// Create a book
export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, author, description, genre, coverImage }: BookInput = req.body;

    // Create book
    const book = await prisma.book.create({
      data: {
        title,
        author,
        description,
        genre,
        coverImage,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { book },
    });
  } catch (error) {
    next(error);
  }
};

// Get all books with pagination and filters
export const getAllBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const author = req.query.author as string | undefined;
    const genre = req.query.genre as string | undefined;

    // Build where clause for filtering
    const where: any = {};
    
    if (author) {
      where.author = {
        contains: author,
        mode: 'insensitive',
      };
    }
    
    if (genre) {
      where.genre = {
        contains: genre,
        mode: 'insensitive',
      };
    }

    // Get books with pagination
    const [books, totalBooks] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.book.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalBooks / limit);

    res.status(200).json({
      status: 'success',
      results: books.length,
      pagination: {
        totalBooks,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: { books },
    });
  } catch (error) {
    next(error);
  }
};

// Get book by ID with reviews
export const getBookById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get book by ID
    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Get reviews with pagination
    const [reviews, totalReviews] = await Promise.all([
      prisma.review.findMany({
        where: { bookId: id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where: { bookId: id } }),
    ]);

    // Calculate average rating
    const averageRating = await prisma.review.aggregate({
      where: { bookId: id },
      _avg: { rating: true },
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalReviews / limit);

    res.status(200).json({
      status: 'success',
      data: {
        book: {
          ...book,
          averageRating: averageRating._avg.rating || 0,
          totalReviews,
        },
        reviews,
        pagination: {
          totalReviews,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Search books
export const searchBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.query as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const type = req.query.type as string || 'all';

    if (!query) {
      throw new AppError('Search query is required', 400);
    }

    // Build search conditions based on type
    let where: any = {};

    if (type === 'title') {
      where.title = {
        contains: query,
        mode: 'insensitive',
      };
    } else if (type === 'author') {
      where.author = {
        contains: query,
        mode: 'insensitive',
      };
    } else {
      // Search in both title and author
      where.OR = [
        {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          author: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Execute search with pagination
    const [books, totalBooks] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.book.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalBooks / limit);

    res.status(200).json({
      status: 'success',
      results: books.length,
      pagination: {
        totalBooks,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: { books },
    });
  } catch (error) {
    next(error);
  }
};