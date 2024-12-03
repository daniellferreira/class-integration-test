const express = require('express');
const app = express();

app.use(express.json());

let users = [];

app.post('/users', (req, res) => {
    const user = req.body;
    if (!user.name || !user.email) {
        return res.status(400).json({ error: 'Name and email are required'});
    }
    user.id = users.length + 1;
    users.push(user);
    res.status(201).json(user);
});

app.get('/users', (req, res) => {
    res.json(users);
});

module.exports = { app, users};