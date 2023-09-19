// Importando librerías
const jwt = require('jsonwebtoken');

// Importando modelos
const Director = require('../models/director');
const Administrator = require("../models/administrator");
const Profesor = require("../models/professor");
const Representant = require("../models/representant");
const Periodo = require('../models/period');

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

        // Consultando con la base de datos el ultimo periodo Escolar para potencialmente pasarlo como request
        const periodo = await Periodo.find().sort({ _id: -1 }).limit(1);

        if (director) {
            req.token = token;
            req.director = director;

            // Comprobar si existe periodo
            if (periodo[0]) {
                periodo[0] ? req.periodo = periodo[0] : req.periodo = null;

                // Verificar si hay lapsos en el periodo
                if (periodo[0].lapsos) {
                    periodo[0].lapsos.length > 0 ? req.lapso = periodo[0].lapsos[periodo[0].lapsos.length - 1] : null;
                }
            }

            next();
        } else if (administrator) {
            // Verificar si está habilitado
            if (!administrator.habilitado) {
                throw new Error(unableMessage);
            }

            req.token = token;
            req.administrador = administrator;
            req.periodo = periodo[0];
            (periodo[0] && periodo[0].lapsos.length > 0) ? req.lapso = periodo[0].lapsos[periodo[0].lapsos.length - 1] : null;
            next();
        } else if (professor) {
            // Verificar si está habilitado
            if (!professor.habilitado) {
                throw new Error(unableMessage);
            }

            req.token = token;
            req.professor = professor;
            req.periodo = periodo[0];
            (periodo[0] && periodo[0].lapsos.length > 0) ? req.lapso = periodo[0].lapsos[periodo[0].lapsos.length - 1] : null;
            next();
        } else if (representant) {
            req.token = token;
            req.representante = representant;
            req.periodo = periodo[0];
            (periodo[0] && periodo[0].lapsos.length > 0) ? req.lapso = periodo[0].lapsos[periodo[0].lapsos.length - 1] : null;
            next();
        } else {
            throw new Error(errorMessage);
        }
    } catch (e) {
        console.log(e)
        res.status(401).send({ error: e.message });
    }
};

module.exports = auth;
