const express = require('express');
const Administrator = require('../models/administrator');
const auth = require("../middleware/auth");
const router = new express.Router();

/*
ESTAS SON LAS RUTAS RELACIONADAS CON EL ADMINISTRADOR:

- CREAR ADMIN
- BORRAR ADMIN
- INICIAR SESIÓN ADMIN
- CERRAR SESIÓN ADMIN
- VER LISTA ADMIN
- VER UN SOLO ADMIN
- HABILITAR ADMIN
- DESHABILITAR ADMIN

*/

// Registrar administrador: Director
router.post('/direccion/administracion/registrarAdministrador', auth, async (req, res) => {
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
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Eliminar administrador: Director
router.delete('/direccion/administracion/:id_administrador/eliminarAdministrador', auth, async (req, res) => {
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
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Iniciar Sesion administrador
router.post('/administracion/iniciarSesion', async (req, res) => {
    try {
        const administrador = await Administrator.findByCredentials(req.body.email, req.body.password);
        const token = await administrador.generateAuthToken();
        res.send({ administrador, token });
    } catch (error) {
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Cerrar sesion administrador
router.post('/administracion/cerrarSesion', auth, async (req, res) => {
    try {

        if (!req.administrador) {
            throw new Error("Acceso Denegado")
        }

        req.administrador.tokens = req.administrador.tokens.filter((token) => token.token !== req.token);
        await req.administrador.save();

        res.send();
    } catch (error) {
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Ver Lista de Administradores: Director
router.get('/administracion', auth, async (req, res) => {
    try {

        if (!req.director) {
            throw new Error("Acceso Denegado")
        }

        // Buscar todos los administradores en la base de datos
        const administradores = await Administrator.find();
        console.log("hey")
        res.send(administradores);
    } catch (error) {
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Ver Administrador: Director
router.get('/administracion/:id_administrador', auth, async (req, res) => {
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
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Habilitar/deshabilitar administrador: Director
router.patch('/direccion/:id_administrador/habilitarAdministrador', auth, async (req, res) => {
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
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

router.patch('/direccion/:id_administrador/deshabilitarAdministrador', auth, async (req, res) => {
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
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

module.exports = router;
