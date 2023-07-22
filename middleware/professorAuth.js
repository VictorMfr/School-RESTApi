const jwt = require('jsonwebtoken');
const Professor = require('../models/professor');

const professorAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const profesor = await Professor.findOne({ _id: decoded._id, 'tokens.token': token });
        
        if (!profesor) {
            throw new Error('No está autentificado');
        }

        if (!profesor.habilitado) {
            throw new Error('El profesor no está habilitado');
        }

        req.token = token;
        req.profesor = profesor;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Por favor, autentifícate.'});
    }
};

module.exports = professorAuth;

