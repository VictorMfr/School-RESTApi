// Importando Librerias
const express = require('express');
const {handleError, serverRoutes} = require('../utils/utils');

// Importando Modelos
const Administrator = require('../models/administrator');

// Importando Middlewares
const auth = require("../middleware/auth");

// Inicializando Router
const router = new express.Router();


// Registrar administrador: Director
router.post(serverRoutes.administrator.newAdministrator, auth, async (req, res) => {
    const administrador = new Administrator({
        ...req.body
    });

    try {

        if (!req.director) {
            throw new Error("Acceso Denegado")
        }

        await administrador.save();
        res.status(201).send({ username: administrador.name, password: administrador.password });
    } catch (error) {
        handleError(error, res);
    }
});

// Eliminar administrador: Director
router.delete(serverRoutes.administrator.deleteAdministrator, auth, async (req, res) => {
    try {

        if (!req.director) {
            throw new Error("Acceso Denegado")
        }

        const administrador = await Administrator.findOneAndDelete({ _id: req.params.id_administrador });

        if (!administrador) {
            return res.status(404).send();
        }

        res.send(administrador);
    } catch (error) {
        handleError(error, res);
    }
});

// Iniciar Sesion administrador
router.post(serverRoutes.administrator.login, async (req, res) => {
    try {
        const administrador = await Administrator.findByCredentials(req.body.email, req.body.password);
        const token = await administrador.generateAuthToken();
        res.send({ administrador, token });
    } catch (error) {
        handleError(error, res);
    }
});

// Cerrar sesion administrador
router.post(serverRoutes.administrator.logout, auth, async (req, res) => {
    try {

        if (!req.administrador) {
            throw new Error("Acceso Denegado")
        }

        req.administrador.tokens = req.administrador.tokens.filter((token) => token.token !== req.token);
        await req.administrador.save();

        res.send();
    } catch (error) {
        handleError(error, res);
    }
});

// Ver Lista de Administradores: Director
router.get(serverRoutes.administrator.seeAdministrators, auth, async (req, res) => {
    try {

        if (!req.director) {
            throw new Error("Acceso Denegado")
        }

        // Buscar todos los administradores en la base de datos
        const administradores = await Administrator.find();
        res.send(administradores);
    } catch (error) {
        handleError(error, res);
    }
});

// Ver Administrador: Director
router.get(serverRoutes.administrator.seeAdministrator, auth, async (req, res) => {
    try {

        if (!req.director) {
            throw new Error("Acceso Denegado")
        }

        // Buscar administrador en la base de datos por ID
        const administrador = await Administrator.findById(req.params.id_administrador);

        if (!administrador) {
            return res.status(404).send();
        }

        res.send(administrador);
    } catch (error) {
        handleError(error, res);
    }
});

// Habilitar/deshabilitar administrador: Director
router.patch(serverRoutes.administrator.enableAdministrador, auth, async (req, res) => {
    try {

        if (!req.director) {
            throw new Error("Acceso Denegado")
        }

        const administrador = await Administrator.findByIdAndUpdate(
            req.params.id_administrador,
            { habilitado: true },
            { new: true }
        );

        if (!administrador) {
            return res.status(404).send();
        }

        res.send(administrador);
    } catch (error) {
        handleError(error, res);
    }
});

router.patch(serverRoutes.administrator.disableAdministrator, auth, async (req, res) => {
    try {

        if (!req.director) {
            throw new Error("Acceso Denegado")
        }

        const administrador = await Administrator.findByIdAndUpdate(
            req.params.id_administrador,
            { habilitado: false },
            { new: true }
        );

        if (!administrador) {
            return res.status(404).send();
        }

        res.send(administrador);
    } catch (error) {
        handleError(error, res);
    }
});

module.exports = router;
