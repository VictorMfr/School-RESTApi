// Importando librerías
const jwt = require('jsonwebtoken');

// Importando modelos
const Director = require('../models/director');
const Administrator = require("../models/administrator");
const Profesor = require("../models/professor");
const Representant = require("../models/representant");

const errorMessage = 'Por favor, autentifícate';
const unableMessage = "No está habilitado";

const auth = async (req, res, next) => {
    try {
        // Verificar
        const token = req.header('Authorization')?.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!token) {
            throw new Error(errorMessage);
        }

        // Consultando con la base de datos y verificar si corresponde a algún usuario del sistema
        const director = await Director.findOne({ _id: decoded._id, 'tokens.token': token });
        const administrator = await Administrator.findOne({ _id: decoded._id, 'tokens.token': token });
        const professor = await Profesor.findOne({ _id: decoded._id, 'tokens.token': token });
        const representant = await Representant.findOne({ _id: decoded._id, 'tokens.token': token });


        if (director) {
            req.token = token;
            req.director = director;
            next();
        } else if (administrator) {
            // Verificar si está habilitado
            if (!administrator.habilitado) {
                throw new Error(unableMessage);
            }

            req.token = token;
            req.administrador = administrator;
            next();
        } else if (professor) {
            // Verificar si está habilitado
            if (!professor.habilitado) {
                throw new Error(unableMessage);
            }

            req.token = token;
            req.professor = professor;
            next();
        } else if (representant) {
            req.token = token;
            req.representant = representant;
            next();
        } else {
            throw new Error(errorMessage);
        }
    } catch (e) {
        res.status(401).send({ error: e });
    }
};

module.exports = auth;
