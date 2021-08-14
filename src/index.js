const express = require('express');
const cors = require('cors');
const { v4: uuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find((user) => user.username === username)

  if(!user){
    return response.status(404).json({ error: 'User not found' })
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  const usernameAlreadyExists = users.some((user) => user.username === username)

  if(usernameAlreadyExists){
    return response.status(400).json({ error: 'User already exists' })
  }

  const user = {
    id: uuid(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body

  const { user } = request

  const todos = {
    id: uuid(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todos)
  
  return response.status(201).json(user.todos[0])
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request 
  const { title, deadline } = request.body

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex === -1){
    return response.status(404).json({ error: 'Todo not found' })
  }

  user.todos[todoIndex].deadline = new Date(deadline)
  user.todos[todoIndex].title = title

  return response.status(200).json(user.todos[todoIndex])
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request 

  const todoIndex = user.todos.findIndex(todo => todo.id === id)
  
  if(todoIndex === -1){
    return response.status(404).json({ error: 'Todo not found' })
  }

  user.todos[todoIndex].done = true

  return response.status(200).json(user.todos[todoIndex])
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request 

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex === -1){
    return response.status(404).json({ error: 'Todo not found' })
  }

  user.todos.splice(todoIndex, 1)

  return response.status(204).end()
});

module.exports = app;