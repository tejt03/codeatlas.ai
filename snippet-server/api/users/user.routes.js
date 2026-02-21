const router = require('express').Router();

const controller = require('./user.controller');
const middleware = require('../middleware/authorization');

// POST /users/login
router.post('/login', controller.loginUser);

// POST /users
router.post('/register', controller.registerUser);

// GET /users/:id
router.get('/:id([0-9a-fA-F]{24})', controller.getUserById);

// PUT /users/:id
router.put('/:id([0-9a-fA-F]{24})', middleware.verifyToken, controller.updateUser);

module.exports = router;
