import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const typeDefs = `#graphql
  enum Genre {Mystery  Fantasy  Classic  Fiction}
  
  type Author{
    id:ID!
    name: String!
    books: [Book!]!

  }

  type Book {
    id: ID!
    title: String!
    authorId: String!
    genre: Genre!
    author: Author
  }

  type Query {
    books: [Book]
    authors: [Author]
    book(id: ID!): Book 
    author(id: ID!): Author
  }
  type Mutation {
   createBook(id: ID!,title: String!,genre: String!): Book
   updateBook(id: ID!, title: String!, genre: String!): Book
   deleteBook(id: ID!): Book
  }

`;

const books = [
  { id: "1", title: "The Great Gatsby", authorId: "1", genre: "Classic" },
  { id: "2", title: "To Kill a Mockingbird", authorId: "2", genre: "Classic" },
  { id: "3", title: "The Catcher in the Rye", authorId: "3", genre: "Classic" },
  {
    id: "4",
    title: "Harry Potter and the Philosopher's Stone",
    authorId: "4",
    genre: "Fantasy",
  },
  { id: "5", title: "Tender Is the Night", authorId: "1", genre: "Classic" },
  {
    id: "6",
    title: "Harry Potter and the Chamber of Secrets",
    authorId: "4",
    genre: "Fantasy",
  },
];

const authors = [
  { id: "1", name: "F. Scott Fitzgerald", books: [] },
  { id: "2", name: "Harper Lee", books: [] },
  { id: "3", name: "J.D. Salinger", books: [] },
  { id: "4", name: "J.K. Rowling", books: [] },
];

const getBookById = (id: string) => {
  const book = books.find((book) => book.id === id);
  return book ? book : new Error("not find book");
};
const getAuthorById = (id: string) => {
  const author = authors.find((author) => author.id === id);
  return author ? author : new Error("not find author");
};

const resolvers = {
  Query: {
    books: () => books,
    authors: () => authors,
    book: (_: any, args: any) => {
      const { id } = args;
      const book = getBookById(id);
      return book;
    },
    author: (_: any, args: any) => {
      const { id } = args;
      const author = getAuthorById(id);
      return author;
    },
  },
  Mutation: {
    createBook: (_: any, args: any) => {
      const { id, title, genre, authorId } = args;
      const newBook = {
        id,
        title,
        genre,
        authorId,
      };
      books.push(newBook);
      return newBook;
    },

    updateBook: (_: any, args: any) => {
      const { id, title, genre } = args;
      const bookIndex = books.findIndex((book) => book.id === id);

      if (bookIndex === -1) {
        throw new Error("Book not found");
      }
      books[bookIndex].title = title;
      books[bookIndex].genre = genre;

      return books[bookIndex];
    },
    deleteBook: (_: any, args: any) => {
      const { id } = args;
      const bookIndex = books.findIndex((book) => book.id === id);

      if (bookIndex === -1) {
        throw new Error("Book not found");
      }

      const deletedBook = books[bookIndex];
      books.splice(bookIndex, 1);
      return deletedBook;
    },
  },
  Author: {
    books: (parent: any) => {
      const authorBooks = books.filter((book) => book.authorId === parent.id);
      return authorBooks;
    },
  },
  Book: {
    author: (parent: any) => {
      const author = authors.find((author) => author.id === parent.authorId);
      return author;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
