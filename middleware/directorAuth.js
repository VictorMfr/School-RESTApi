const jwt = require('jsonwebtoken');
const Director = require('../models/director');

const errorMessage = 'Por favor, autentifícate';

const directorAuth = async (req, res, next) => {
    try {
        console.log("Director");
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error(errorMessage);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const director = await Director.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!director) {
            throw new Error(errorMessage);
        }

        req.token = token;
        req.director = director;
        next();
    } catch (e) {
        res.status(401).send({ error: errorMessage });
    }
};

module.exports = directorAuth;
