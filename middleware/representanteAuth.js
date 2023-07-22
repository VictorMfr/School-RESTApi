const jwt = require('jsonwebtoken')
const Representante = require('../models/representant')

const representanteAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const representante = await Representante.findOne({ _id: decoded._id, 'tokens.token': token })

        
        if (!representante) {
            throw new Error()
        }

        req.token = token
        req.representante = representante
        next()
    } catch (e) {
        res.status(401).send({ error: 'Por favor, autentificate.'})
    }
}

module.exports = representanteAuth