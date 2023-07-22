const jwt = require('jsonwebtoken');
const Administrator = require('../models/administrator');

const administratorAuth = async (req, res, next) => {
    try {
        // Comprobar si es administrador
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Buscar en la tabla de Administrador si existe un administrador con esa clave 
        const administrador = await Administrator.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!administrador) {
            throw new Error("No está autentificado");
        }

        if (!administrador.habilitado) {
            throw new Error("No está habilitado");
        }

        req.token = token;
        req.administrador = administrador;
        next();
    } catch (e) {
        res.status(401).send({ error: e.message });
    }
};

module.exports = administratorAuth;
