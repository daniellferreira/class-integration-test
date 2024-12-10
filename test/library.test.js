const request = require("supertest");
const { app, books, loans } = require("../src/2-library/library");

describe("API de Biblioteca", () => {
  beforeEach(() => {
    books.length = 0;
    loans.length = 0;
  });

  it("deve adicionar um novo livro com sucesso", async () => {
    const newBook = { title: "Livrasso", description: "Livro show" };

    const response = await request(app)
      .post("/books")
      .send(newBook)
      .expect(201)
      .expect("Content-Type", /json/);

    expect(response.body).toMatchObject(newBook);
    expect(response.body).toHaveProperty("id", 1);
    expect(books).toHaveLength(1);
  });

  it("deve retornar erro ao tentar adicionar livro sem nome", async () => {
    const newBook = { description: "Livro show" };

    const response = await request(app)
      .post("/books")
      .send(newBook)
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      error: "Title and Description are required",
    });
    expect(books).toHaveLength(0);
  });

  it("deve listar os livros cadastrados", async () => {
    books.push({ id: 1, title: "John Doe", description: "descricao" });

    const response = await request(app)
      .get("/books")
      .expect(200)
      .expect("Content-Type", /json/);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      title: "John Doe",
      description: "descricao",
    });
  });

  it("deve atualizar um livro com sucesso", async () => {
    books.push({ id: 1, title: "Book A", description: "Description A" });

    const updatedBook = {
      title: "Updated Book",
      description: "Updated Description",
    };

    const response = await request(app)
      .put("/books/1")
      .send(updatedBook)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(response.body).toMatchObject(updatedBook);
  });

  it("deve deletar um livro com sucesso", async () => {
    books.push({ id: 1, title: "Book A", description: "Description A" });

    await request(app).delete("/books/1").expect(204);

    expect(books).toHaveLength(0);
  });

  it("deve retornar erro ao tentar deletar um livro inexistente", async () => {
    const response = await request(app)
      .delete("/books/999")
      .expect(404)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({ error: "Book not found" });
  });
});
