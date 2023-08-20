const express = require('express')
const Director = require('../models/director')
const auth = require("../middleware/auth")
const router = new express.Router()

/*
ESTAS SON LAS RUTAS PARA EL DIRECTOR: CREATE, DELETE, LOGGIN, LOGGOUT
*/

// Registro de director
router.post('/direccion/nuevoDirector', async (req, res) => {
    try {
        const director = new Director(req.body);
        await director.save();
        const token = await director.generateAuthToken();
        res.status(201).send({ director, token });
    } catch (error) {
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Inicio de sesión de director
router.post('/direccion/iniciarSesion', async (req, res) => {
    try {
        const director = await Director.findByCredentials(req.body.email, req.body.password);
        const token = await director.generateAuthToken();
        res.send({ director, token });
    } catch (error) {
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Cerrar sesión director
router.post('/direccion/cerrarSesion', auth, async (req, res) => {
    try {

        if (!req.director) {
            throw new Error("Acceso Denegado")
        }

        req.director.tokens = req.director.tokens.filter((token) => token.token !== req.token);
        await req.director.save();
        res.send();
    } catch (error) {
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Borrar director
router.delete('/direccion/eliminarDirector', auth, async (req, res) => {

    if (!req.director) {
        throw new Error("Acceso Denegado")
    }

    try {
        await Director.findByIdAndDelete(req.director._id);
        res.send(req.director);
    } catch (error) {
        console.log(error.message)
        res.status(400).send({error: error.message});
    }
});

module.exports = router;
