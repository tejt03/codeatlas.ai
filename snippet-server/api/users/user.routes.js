const router = require('express').Router();

const controller = require('./user.controller');
const middleware = require('../middleware/authorization');

// GET /users/:id
router.get('/:id', controller.getUserById);

// POST /users
router.post('/register', controller.registerUser);

// POST /users/login
router.post('/login', controller.loginUser);

// PUT /users/:id
router.put('/:id', middleware.verifyToken, controller.updateUser);

module.exports = router;
