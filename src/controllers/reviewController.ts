import { Request, Response, NextFunction } from 'express';
import prisma from '../db/prismaClient';
import { AppError } from '../utils/appError';
import { ReviewInput } from '../types';

// Create a review for a book
export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: bookId } = req.params;
    const userId = req.user!.id;
    const { content, rating }: ReviewInput = req.body;

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Check if user already reviewed this book
    const existingReview = await prisma.review.findFirst({
      where: {
        bookId,
        userId,
      },
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this book', 400);
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        content,
        rating,
        book: { connect: { id: bookId } },
        user: { connect: { id: userId } },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

// Update a review
export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { content, rating }: Partial<ReviewInput> = req.body;

    // Check if review exists and belongs to user
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (review.userId !== userId) {
      throw new AppError('You can only update your own reviews', 403);
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        content,
        rating,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: { review: updatedReview },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a review
export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if review exists and belongs to user
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (review.userId !== userId) {
      throw new AppError('You can only delete your own reviews', 403);
    }

    // Delete review
    await prisma.review.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};