const express = require('express');
const cors = require('cors');
const mongo = require('./mongo');

const app = express();
mongo.connectDB();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// options object to expose header to the client
const options = { exposedHeaders: ['Authorization'] };

// middleware to enable cors
app.use(cors(options));

// middleware to parse POST/PUT bodies in express
app.use(express.json());

const users = require('./api/users/user.routes.js');
const snippets = require('./api/snippets/snippet.routes.js');
const bookmarks = require('./api/bookmarks/bookmark.routes.js');

// mount the resource routes to express app
app.use('/users', users);
app.use('/snippets', snippets);
app.use('/bookmarks', bookmarks);


