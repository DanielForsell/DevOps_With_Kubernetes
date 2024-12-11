const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store for todos
let todos = [{"id": 1, "task": "Task 1"}, {"id": 2, "task": "Task 2"}];

const cors = require('cors');
app.use(cors());
app.use(express.json());

app.get('/backend/todos', (req, res) => {
    res.status(200).json(todos);
});


app.post('/backend/todos', (req, res) => {
    const { task } = req.body;
    if (!task) {
      return res.status(400).json({ error: 'Task is required' });
    }
    const newTodo = {
      id: todos.length + 1,
      task
    };
    todos.push(newTodo);
    res.status(201).json(newTodo); // Return the created todo
  });
  
  app.delete('/backend/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const todoIndex = todos.findIndex(todo => todo.id === id);
    
    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    todos.splice(todoIndex, 1);
    res.status(200).json({ message: 'Todo deleted' });
  });
  
  app.put('/backend/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { task } = req.body;
    
    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    todos[todoIndex] = { ...todos[todoIndex], task };
    res.status(200).json(todos[todoIndex]);
  });

app.get('/test', (req, res) => {
    res.status(201).json({ message: 'Connect to the backend works' });
})

// Start the server
app.listen(PORT, () => {
    console.log(`ToDo-BackEnd listening on port ${PORT}`);
});