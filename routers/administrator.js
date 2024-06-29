// Importando Librerias
const express = require('express');
const { handleError, serverRoutes, checkAuths } = require('../utils/utils');

// Importando Modelos
const Administrator = require('../models/administrator');

// Importando Middlewares
const auth = require("../middleware/auth");

// Inicializando Router
const router = new express.Router();

// Registrar administrador: Solo Director
router.post(serverRoutes.administrator.newAdministrator, auth, async (req, res) => {
    try {
        // Verificando si se trata del Director
        checkAuths.checkIfAuthDirector(req)

        // Creando Administrador
        const administrador = new Administrator({
            ...req.body
        });

        await administrador.save();
        res.status(201).send({ username: administrador.name, password: administrador.password });
    } catch (error) {
        handleError(error, res);
    }
});

// Eliminar administrador: Solo Director
router.delete(serverRoutes.administrator.deleteAdministrator, auth, async (req, res) => {
    try {
        // Verificando si se trata del Director
        checkAuths.checkIfAuthDirector(req);

        // Eliminando Administrador
        const administrador = await Administrator.findOneAndDelete({ _id: req.params.id_administrador });

        if (!administrador) {
            return res.status(500).send();
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

        if (!administrador.habilitado) {
            throw new Error("Usted está inhabilitado")
        }
        
        const token = await administrador.generateAuthToken();

        res.send({ administrador, token });
    } catch (error) {
        handleError(error, res);
    }
});

// Cerrar sesion administrador: Solo Administrador
router.post(serverRoutes.administrator.logout, auth, async (req, res) => {
    try {

        // Verificando si se trata del Administrador
        checkAuths.checkIfAuthAdministrator(req);

        // Cerrando Sesion
        req.administrador.tokens = req.administrador.tokens.filter((token) => token.token !== req.token);
        await req.administrador.save();

        res.send();
    } catch (error) {
        handleError(error, res);
    }
});

// Ver Lista de Administradores: Solo Director
router.get(serverRoutes.administrator.seeAdministrators, auth, async (req, res) => {
    try {
        // Verificando si se trata del Director
        checkAuths.checkIfAuthDirector(req)

        // Buscar todos los administradores en la base de datos
        const administradores = await Administrator.find();
        res.send(administradores);
    } catch (error) {
        handleError(error, res);
    }
});

// Ver Administrador: Solo Director
router.get(serverRoutes.administrator.seeAdministrator, auth, async (req, res) => {
    try {
        // Verificando si se trata del Director
        checkAuths.checkIfAuthDirector(req);

        // Buscar administrador en la base de datos por ID
        const administrador = await Administrator.findById(req.params.id_administrador);

        if (!administrador) {
            return res.status(404).send({ error: "No encontrado" });
        }

        res.send(administrador);
    } catch (error) {
        handleError(error, res);
    }
});

// Habilitar administrador: Solo Director
router.patch(serverRoutes.administrator.enableAdministrador, auth, async (req, res) => {
    try {
        // Verificando si se trata del Director
        checkAuths.checkIfAuthDirector(req);

        const administrador = await Administrator.findByIdAndUpdate(
            req.params.id_administrador,
            { habilitado: true },
            { new: true }
        );

        if (!administrador) {
            return res.status(404).send({ error: "No existe tal Administrador" });
        }

        res.send(administrador);
    } catch (error) {
        handleError(error, res);
    }
});

// Deshabilitar administrador: Solo Director
router.patch(serverRoutes.administrator.disableAdministrator, auth, async (req, res) => {
    try {
        // Verificando si se trata del Director
        checkAuths.checkIfAuthDirector

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
