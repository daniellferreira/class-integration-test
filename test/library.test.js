const request = require('supertest');
const { app, books, loans } = require('../src/library/app');

describe('API de Biblioteca', () => {
    beforeEach(() => {
        books.length = 0; 
        loans.length = 0; 
    });

    it('deve adicionar um novo livro com sucesso', async () => {
        const newBook = { title: 'O Senhor dos Anéis', author: 'J.R.R. Tolkien' };

        const response = await request(app)
            .post('/books')
            .send(newBook)
            .expect(201)
            .expect('Content-Type', /json/);

        expect(response.body).toMatchObject(newBook);
        expect(response.body).toHaveProperty('id', 1);
        expect(books).toHaveLength(1);
    });

    it('deve retornar erro ao tentar adicionar um livro com dados inválidos', async () => {
        const response = await request(app)
            .post('/books')
            .send({ author: 'J.K. Rowling' })
            .expect(400)
            .expect('Content-Type', /json/);

        expect(response.body).toEqual({ error: 'Title and author are required' });
        expect(books).toHaveLength(0);
    });

    it('deve listar todos os livros', async () => {
        books.push({ id: 1, title: '1984', author: 'George Orwell', available: true });

        const response = await request(app)
            .get('/books')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toMatchObject({ title: '1984', author: 'George Orwell' });
    });

    it('deve atualizar as informações de um livro existente', async () => {
        books.push({ id: 1, title: 'Old Title', author: 'Old Author', available: true });

        const response = await request(app)
            .put('/books/1')
            .send({ title: 'New Title', author: 'New Author' })
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toMatchObject({ title: 'New Title', author: 'New Author' });
        expect(books[0]).toMatchObject({ title: 'New Title', author: 'New Author' });
    });

    it('deve remover um livro e confirmar que ele não existe mais', async () => {
        books.push({ id: 1, title: 'Book to Remove', author: 'Author', available: true });

        await request(app)
            .delete('/books/1')
            .expect(204);

        expect(books).toHaveLength(0);
    });

    it('deve realizar um empréstimo e marcar o livro como indisponível', async () => {
        books.push({ id: 1, title: 'Available Book', author: 'Author', available: true });

        const response = await request(app)
            .post('/loans')
            .send({ bookId: 1 })
            .expect(201)
            .expect('Content-Type', /json/);

        expect(response.body.book.available).toBe(false);
        expect(loans).toHaveLength(1);
    });

    it('deve retornar erro ao tentar emprestar um livro indisponível', async () => {
        books.push({ id: 1, title: 'Loaned Book', author: 'Author', available: false });

        const response = await request(app)
            .post('/loans')
            .send({ bookId: 1 })
            .expect(400)
            .expect('Content-Type', /json/);

        expect(response.body).toEqual({ error: 'Book is not available for loan' });
    });

    it('deve realizar a devolução de um livro e marcá-lo como disponível', async () => {
        books.push({ id: 1, title: 'Loaned Book', author: 'Author', available: false });

        const response = await request(app)
            .post('/returns')
            .send({ bookId: 1 })
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body.book.available).toBe(true);
    });

    it('deve retornar erro ao tentar devolver um livro que não está emprestado', async () => {
        books.push({ id: 1, title: 'Available Book', author: 'Author', available: true });

        const response = await request(app)
            .post('/returns')
            .send({ bookId: 1 })
            .expect(400)
            .expect('Content-Type', /json/);

        expect(response.body).toEqual({ error: 'Book is not currently loaned' });
    });
});
