const router = require('express').Router();

const controller = require('./bookmark.controller');
const middleware = require('../middleware/authorization');

// POST /bookmarks
router.post('/', controller.createBookmark);

// DELETE /bookmarks/:id
router.delete('/:id',controller.deleteBookmark);

module.exports = router;
