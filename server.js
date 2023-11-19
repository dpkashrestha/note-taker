const express = require('express');
const path = require('path');
const fs = require('fs');
// Helper library for generating unique ids
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');

const { readFromFile, readAndAppend } = require('./helpers/fsUtils');

const PORT = 3001;

const app = express();

// Middleware for parsing application/json
app.use(express.json());
//
app.use(express.urlencoded({ extended: true }));
//
app.use(express.static('public'));
// Use bodyParser to parse JSON requests
app.use(bodyParser.json());


app.get('/api/notes', (req, res) => {
    readFromFile('./db/notes.json').then((data) => res.json(JSON.parse(data)));
  });

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// POST request to add a note
app.post('/api/notes', (req, res) => {
  // Log that a POST request was received
  console.info(`${req.method} request received to add a note`);

  // Destructuring assignment for the items in req.body
  const { id,title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    const newId = uuidv4();
    // Variable for the object we will save
    const newNote = {
      id: newId,
      title : title, 
      text : text
    };

    readAndAppend(newNote, './db/notes.json');

    const response = {
      status: 'success',
      body: newNote,
    };

    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json('Error in posting note');
  }
});

app.delete('/api/notes/:id', (req, res) => {
    // Log that a POST request was received
    console.info(`${req.method} note deleted`);
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);




