const jwt = require('jsonwebtoken');
const Administrator = require('../models/administrator');
const Director = require('../models/director');

const directorOrAdministratorAuth = async (req, res, next) => {
    try {
        // Verificar Token
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar en la tabla de Administracion si existe un administrador con esa clave 
        const administrador = await Administrator.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!administrador) {
            // Buscar en la tabla de Direccion si existe un director con esa clave 
            const director = await Director.findOne({ _id: decoded._id, 'tokens.token': token });
            
            if (!director) {
                // No existe ni director ni administrador, lanzar error
                throw new Error();
            }
    
            req.token = token;
            req.director = director;
            return next();
        }

        req.token = token;
        req.administrador = administrador;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Por favor, autentifícate.' });
    }
};

module.exports = directorOrAdministratorAuth;