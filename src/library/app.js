const express = require('express');
const app = express();

app.use(express.json());

let books = [];
let loans = [];


app.post('/books', (req, res) => {
    const { title, author } = req.body;
    if (!title || !author) {
        return res.status(400).json({ error: 'Title and author are required' });
    }
    const book = { id: books.length + 1, title, author, available: true };
    books.push(book);
    res.status(201).json(book);
});


app.get('/books', (req, res) => {
    res.json(books);
});


app.put('/books/:id', (req, res) => {
    const { id } = req.params;
    const { title, author } = req.body;
    const book = books.find(b => b.id === Number(id));
    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }
    if (title) book.title = title;
    if (author) book.author = author;
    res.json(book);
});


app.delete('/books/:id', (req, res) => {
    const { id } = req.params;
    const index = books.findIndex(b => b.id === Number(id));
    if (index === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }
    books.splice(index, 1);
    res.status(204).send();
});


app.post('/loans', (req, res) => {
    const { bookId } = req.body;
    const book = books.find(b => b.id === bookId);
    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }
    if (!book.available) {
        return res.status(400).json({ error: 'Book is not available for loan' });
    }
    book.available = false;
    loans.push({ bookId, date: new Date() });
    res.status(201).json({ message: 'Loan successful', book });
});


app.post('/returns', (req, res) => {
    const { bookId } = req.body;
    const book = books.find(b => b.id === bookId);
    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }
    if (book.available) {
        return res.status(400).json({ error: 'Book is not currently loaned' });
    }
    book.available = true;
    res.json({ message: 'Return successful', book });
});

module.exports = { app, books, loans };
