const router = require('express').Router();

const controller = require('./snippet.controller');
const { explainSnippet } = require('./explain.controller');

// GET /snippets
router.get('/', controller.getSnippets);

// GET /snippets/bookmark-counts
router.get('/bookmark-counts', controller.getBookmarkCounts);

// GET /snippets/:id
router.get('/:id', controller.getSnippetById);

// POST /snippets
router.post('/', controller.createSnippet);

// DELETE /snippets/:id
router.delete('/:id', controller.deleteSnippet);

// POST /snippets/explain
router.post('/explain', explainSnippet);

module.exports = router;
