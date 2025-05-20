# Book Review API

A RESTful API for a Book Review system built with Node.js, Express, TypeScript, and Prisma.

## Features

- User authentication with JWT
- Book management (create, read, search)
- Review system (create, update, delete)
- Pagination and filtering
- Search functionality

## Tech Stack

- Node.js with Express
- TypeScript
- Prisma ORM with SQLite (can be changed to PostgreSQL or MongoDB)
- JWT for authentication
- Zod for validation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/book-review-api.git
cd book-review-api
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   - Copy the `.env.example` file to `.env` and update the values as needed

4. Set up the database:

```bash
npx prisma migrate dev --name init
```

5. Start the development server:

```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Authenticate a user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### Books

- `POST /api/books` - Add a new book (authenticated)
  ```json
  {
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "description": "A novel about the American Dream",
    "genre": "Classic",
    "coverImage": "https://example.com/gatsby.jpg"
  }
  ```

- `GET /api/books` - Get all books (with pagination)
  - Query parameters:
    - `page` (default: 1)
    - `limit` (default: 10)
    - `author` (optional)
    - `genre` (optional)

- `GET /api/books/:id` - Get book details by ID, including average rating and reviews

- `GET /api/search` - Search books by title or author
  - Query parameters:
    - `query` (required)
    - `type` (optional, values: 'title', 'author', 'all', default: 'all')
    - `page` (default: 1)
    - `limit` (default: 10)

### Reviews

- `POST /api/books/:id/reviews` - Submit a review (authenticated)
  ```json
  {
    "content": "This book was amazing!",
    "rating": 5
  }
  ```

- `PUT /api/reviews/:id` - Update your own review (authenticated)
  ```json
  {
    "content": "Updated review content",
    "rating": 4
  }
  ```

- `DELETE /api/reviews/:id` - Delete your own review (authenticated)

## Database Schema

### User
- id: uuid (primary key)
- email: string (unique)
- password: string (hashed)
- name: string
- createdAt: datetime
- updatedAt: datetime

### Book
- id: uuid (primary key)
- title: string
- author: string
- description: string (optional)
- genre: string (optional)
- coverImage: string (optional)
- createdAt: datetime
- updatedAt: datetime

### Review
- id: uuid (primary key)
- content: string
- rating: integer
- bookId: uuid (foreign key)
- userId: uuid (foreign key)
- createdAt: datetime
- updatedAt: datetime
- Unique constraint: [bookId, userId] (one review per user per book)

## Design Decisions

1. **Authentication**: JWT-based authentication was chosen for its stateless nature, which makes it suitable for RESTful APIs.

2. **Database**: Prisma ORM was selected for type-safe database access, with SQLite as the default database for easy development.

3. **Validation**: Zod is used for request validation to ensure data integrity.

4. **Error Handling**: A centralized error handling middleware is implemented to provide consistent error responses.

5. **Pagination**: All list endpoints include pagination to improve performance and user experience.

## Example API Requests (using curl)

### Register a new user

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create a book (with authentication)

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "description": "A novel about the American Dream",
    "genre": "Classic"
  }'
```

### Get all books with pagination

```bash
curl -X GET "http://localhost:3000/api/books?page=1&limit=10&genre=Classic"
```

### Search for books

```bash
curl -X GET "http://localhost:3000/api/books/search?query=Gatsby&type=title"
```

### Add a review (with authentication)

```bash
curl -X POST http://localhost:3000/api/books/BOOK_ID_HERE/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "content": "This book was amazing!",
    "rating": 5
  }'
```