const express = require("express");
const path = require("path");
const fs = require("fs");

// Helper library for generating unique ids
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");

// Helper functions for reading and writing to the JSON file
const {
  readFromFile,
  readAndAppend,
  readDataFromFile,
  writeToFile,
} = require("./helpers/fsUtils");

const PORT = 3001;

const app = express();

const dbNotePath = "./db/notes.json";

// Middleware for parsing application/json and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to serve up static assets from the public folder
app.use(express.static("public"));

// Use bodyParser to parse JSON requests
app.use(bodyParser.json());

// GET Api request for notes data
app.get("/api/notes", (req, res) => {
  readFromFile("./db/notes.json").then((data) => res.json(JSON.parse(data)));
});

app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/notes.html"))
);

app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

// POST request to add a note
app.post("/api/notes", (req, res) => {
  // Log that a POST request was received
  console.info(`${req.method} request received to add a note`);

  // Destructuring assignment for the items in req.body
  const { id, title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    const newId = uuidv4();
    // Variable for the object we will save
    const newNote = {
      id: newId,
      title: title,
      text: text,
    };

    readAndAppend(newNote, "./db/notes.json");

    const response = {
      status: "success",
      body: newNote,
    };

    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json("Error in posting note");
  }
});

// PUT request to update notes

// Update route (PUT or PATCH) to update a note by ID
app.put("/api/notes/:id", (req, res) => {
  const noteId = req.params.id;
  const updatedNote = req.body;

  let notes = readDataFromFile(dbNotePath);

  const index = notes.findIndex((note) => note.id === noteId);

  if (index !== -1) {
    // Update the existing note with the new content
    notes[index] = { ...notes[index], ...updatedNote };

    // Write the updated notes back to the file
    writeToFile(dbNotePath, notes);

    res.status(200).json(notes[index]);
  } else {
    res.status(404).json({ error: "Note not found" });
  }
});

// DELETE request to delete notes
app.delete("/api/notes/:id", (req, res) => {
  const noteId = req.params.id;
  let notes = readDataFromFile(dbNotePath);

  // Find the index of the note with the given ID
  const index = notes.findIndex((note) => note.id === noteId);

  // If the note is found, remove it from the array
  if (index !== -1) {
    notes.splice(index, 1);
    writeToFile(dbNotePath, notes);
    res.status(204).send(); // 204 No Content - successful deletion
  } else {
    res.status(404).json({ error: "Note not found" });
  }
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
