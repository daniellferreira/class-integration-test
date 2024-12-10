const express = require("express");
const app = express();

app.use(express.json());

let books = [];
let users = [];
let loans = [];

// Método POST para adicionar um novo livro
app.post("/books", (req, res) => {
  const book = req.body;
  if (!book.title || !book.description) {
    return res
      .status(400)
      .json({ error: "Title and Description are required" });
  }
  book.id = books.length + 1;
  books.push(book);
  res.status(201).json(book);
});

// Método GET para listar todos os livros
app.get("/books", (req, res) => {
  res.json(books);
});

// Método POST para realizar um empréstimo
app.post("/loans", (req, res) => {
  const { userId, bookId } = req.body;

  const user = users.find((user) => user.id === userId);
  const book = books.find((book) => book.id === bookId);

  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }
  if (!book) {
    return res.status(400).json({ error: "Book not found" });
  }

  // Verifica se o livro já foi emprestado
  if (loans.some((loan) => loan.bookId === bookId && !loan.returned)) {
    return res.status(400).json({ error: "Book is already on loan" });
  }

  const loan = {
    id: loans.length + 1,
    userId,
    bookId,
    borrowedAt: new Date(),
    returned: false,
  };
  loans.push(loan);

  res.status(201).json(loan);
});

// Método POST para realizar a devolução de um livro
app.post("/returns", (req, res) => {
  const { userId, bookId } = req.body;

  const loan = loans.find(
    (loan) => loan.userId === userId && loan.bookId === bookId && !loan.returned
  );

  if (!loan) {
    return res
      .status(400)
      .json({ error: "Loan not found or already returned" });
  }

  loan.returned = true;
  loan.returnedAt = new Date();

  res.json({ message: "Book returned successfully", loan });
});

// Método PUT para atualizar informações de um livro
app.put("/books/:id", (req, res) => {
  const { id } = req.params;
  const updatedBook = req.body;

  const bookIndex = books.findIndex((book) => book.id == id);
  if (bookIndex === -1) {
    return res.status(404).json({ error: "Book not found" });
  }

  const book = books[bookIndex];
  if (updatedBook.title) book.title = updatedBook.title;
  if (updatedBook.description) book.description = updatedBook.description;

  res.json(book);
});

// Método DELETE para remover um livro
app.delete("/books/:id", (req, res) => {
  const { id } = req.params;

  const bookIndex = books.findIndex((book) => book.id == id);
  if (bookIndex === -1) {
    return res.status(404).json({ error: "Book not found" });
  }

  books.splice(bookIndex, 1);
  res.status(204).send();
});

module.exports = { app, books, users, loans };
