const jwt = require('jsonwebtoken');
const Representante = require('../models/representant');

const RepresentanteControlAuth = async (req, res, next) => {
    try {
        const representante = await Representante.findOne({ _id: req.params.id_representante });
        if (!representante) {
            throw new Error('El representante no existe');
        }

        req.representante = representante;
        next();
    } catch (e) {
        res.status(401).send({ error: e.message });
    }
};

module.exports = RepresentanteControlAuth;
