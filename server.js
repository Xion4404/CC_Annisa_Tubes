const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// In-memory storage
let todos = [];
let nextId = 1;

// GET all todos
app.get('/api/todos', (req, res) => {
  res.json({
    status: 'success',
    message: 'Data retrieved successfully',
    data: todos,
  });
});

// GET todo by ID
app.get('/api/todos/:id', (req, res) => {
  const todo = todos.find((t) => t.id == req.params.id);
  if (!todo) {
    return res.status(404).json({
      status: 'error',
      message: 'To-do with the given ID not found',
    });
  }
  res.json({
    status: 'success',
    message: 'Data retrieved successfully',
    data: todo,
  });
});

// POST create new todo
app.post('/api/todos', (req, res) => {
  const { title, description, dueDate } = req.body;
  const newTodo = {
    id: nextId++,
    title,
    description,
    completed: false,
    dueDate,
    createdAt: new Date().toISOString(),
  };
  todos.push(newTodo);
  res.status(201).json({
    status: 'success',
    message: 'To-do created successfully',
    data: newTodo,
  });
});

// PUT update todo by ID
app.put('/api/todos/:id', (req, res) => {
  const { title, description, completed, dueDate } = req.body;
  const todo = todos.find((t) => t.id == req.params.id);
  if (!todo) {
    return res.status(404).json({
      status: 'error',
      message: 'To-do with the given ID not found',
    });
  }
  todo.title = title;
  todo.description = description;
  todo.completed = completed;
  todo.dueDate = dueDate;
  res.json({
    status: 'success',
    message: 'To-do updated successfully',
    data: todo,
  });
});

// DELETE todo by ID
app.delete('/api/todos/:id', (req, res) => {
  const index = todos.findIndex((t) => t.id == req.params.id);
  if (index === -1) {
    return res.status(404).json({
      status: 'error',
      message: 'To-do with the given ID not found',
    });
  }
  const deleted = todos.splice(index, 1);
  res.json({
    status: 'success',
    message: 'To-do deleted successfully',
    data: deleted[0],
  });
});

// Test route
app.get('/', (req, res) => {
  res.send('Halo dari backend!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
