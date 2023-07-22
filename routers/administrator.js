const express = require('express');
const Administrator = require('../models/administrator');
const directorAuth = require('../middleware/directorAuth');
const administratorAuth = require('../middleware/administratorAuth');
const router = new express.Router();

// Registrar administrador: Director
router.post('/direccion/administracion/registrarAdministrador', directorAuth, async (req, res) => {
    const administrador = new Administrator({
        ...req.body
    });

    try {
        await administrador.save();
        res.status(201).send({ username: administrador.name, password: administrador.password });
    } catch (e) {
        res.status(400).send(e);
    }
});

// Eliminar administrador: Director
router.delete('/direccion/administracion/:id_administrador/eliminarAdministrador', directorAuth, async (req, res) => {
    try {
        const administrador = await Administrator.findOneAndDelete({ _id: req.params.id_administrador });

        if (!administrador) {
            return res.status(404).send();
        }

        res.send(administrador);
    } catch (e) {
        res.status(500).send();
    }
});

// Iniciar Sesion administrador
router.post('/administracion/iniciarSesion', async (req, res) => {
    try {
        const administrador = await Administrator.findByCredentials(req.body.email, req.body.password);
        const token = await administrador.generateAuthToken();
        res.send({ administrador, token });
    } catch (e) {
        res.status(400).send();
    }
});

// Cerrar sesion administrador
router.post('/administracion/cerrarSesion', administratorAuth, async (req, res) => {
    try {
        req.administrador.tokens = req.administrador.tokens.filter((token) => token.token !== req.token);
        await req.administrador.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

// Ver Lista de Administradores
router.get('/administracion', directorAuth, async (req, res) => {
    try {
        // Buscar todos los administradores en la base de datos
        const administradores = await Administrator.find();

        res.send(administradores);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error al obtener la lista de administradores' });
    }
});

// Ver Administrador
router.get('/administracion/:id_administrador', directorAuth, async (req, res) => {
    try {
        // Buscar administrador en la base de datos por ID
        const administrador = await Administrator.findById(req.params.id_administrador);

        if (!administrador) {
            return res.status(404).send();
        }

        res.send(administrador);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error al obtener el administrador' });
    }
});

// Habilitar/deshabilitar administrador: Director

router.patch('/direccion/:id_administrador/habilitarAdministrador', directorAuth, async (req, res) => {
    try {
        const administrador = await Administrator.findByIdAndUpdate(
            req.params.id_administrador,
            { habilitado: true },
            { new: true }
        );

        if (!administrador) {
            return res.status(404).send();
        }

        res.send(administrador);
    } catch (e) {
        res.status(500).send();
    }
});

router.patch('/direccion/:id_administrador/deshabilitarAdministrador', directorAuth, async (req, res) => {
    try {
        const administrador = await Administrator.findByIdAndUpdate(
            req.params.id_administrador,
            { habilitado: false },
            { new: true }
        );

        if (!administrador) {
            return res.status(404).send();
        }

        res.send(administrador);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;
