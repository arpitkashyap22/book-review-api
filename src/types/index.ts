export interface UserInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface BookInput {
  title: string;
  author: string;
  description?: string;
  genre?: string;
  coverImage?: string;
}

export interface ReviewInput {
  content: string;
  rating: number;
}

export interface Pagination {
  page: number;
  limit: number;
}