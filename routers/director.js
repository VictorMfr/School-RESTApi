const express = require('express')
const Director = require('../models/director')
const directorAuth = require('../middleware/directorAuth')
const router = new express.Router()

// Registro de director
router.post('/direccion/nuevoDirector', async (req, res) => {
    try {
        const director = new Director(req.body);
        await director.save();
        const token = await director.generateAuthToken();
        res.status(201).send({ director, token });
    } catch (e) {
        res.status(400).send(e);
        console.log(e)
    }
});

// Inicio de sesión de director
router.post('/direccion/iniciarSesion', async (req, res) => {
    try {
        const director = await Director.findByCredentials(req.body.email, req.body.password);
        const token = await director.generateAuthToken();
        res.send({ director, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

// Cerrar sesión director
router.post('/direccion/cerrarSesion', directorAuth, async (req, res) => {
    try {
        req.director.tokens = req.director.tokens.filter((token) => token.token !== req.token);
        await req.director.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

// Borrar director
router.delete('/direccion/eliminarDirector', directorAuth, async (req, res) => {
    try {
        await Director.findByIdAndDelete(req.director._id);
        res.send(req.director);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;
