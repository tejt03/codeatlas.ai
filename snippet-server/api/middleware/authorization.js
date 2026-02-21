const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res , next) => {
    const { authorization } = req.headers;

    if(!authorization) {
        return res.status(401).json({ error: 'Unauthorized: no token.' });
    }

    try {
        const token = authorization.split(' ').pop();

        const verifed = jwt.verify(token, JWT_SECRET);
        req.user = verifed; 

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: invalid token.' });
    }
};

module.exports = {
    verifyToken
};

