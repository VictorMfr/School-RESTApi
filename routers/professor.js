const express = require('express');
const Profesor = require('../models/professor');
const directorOrAdministratorAuth = require('../middleware/directorOrAdministratorAuth');
const professorAuth = require('../middleware/professorAuth');
const Representante = require("../models/representant");
const router = new express.Router();

// Registrar docente: Director y Administrador
router.post('/docente/registrarDocente', directorOrAdministratorAuth, async (req, res) => {
    const profesor = new Profesor(req.body);
    try {
        await profesor.save();
        res.status(201).send({ profesor });
    } catch (e) {
        res.status(400).send(e);
    }
});

// Borrar docente: Director y Administrador
router.delete('/docente/:id_docente/eliminarDocente', directorOrAdministratorAuth, async (req, res) => {
    try {
        const profesor = await Profesor.findOneAndDelete({ _id: req.params.id_docente });

        if (!profesor) {
            return res.status(404).send();
        }

        res.send(profesor);
    } catch (e) {
        res.status(500).send();
    }
});

// Inicio de sesión de docente: Director y Administrador
router.post('/docente/iniciarSesion', async (req, res) => {
    try {
        const profesor = await Profesor.findByCredentials(req.body.email, req.body.password);
        const token = await profesor.generateAuthToken();
        res.send({ profesor, token });
    } catch (e) {
        res.status(400).send();
    }
});

// Cerrar sesión director: Director y Administrador
router.post('/docente/cerrarSesion', professorAuth, async (req, res) => {
    try {
        req.profesor.tokens = req.profesor.tokens.filter((token) => token.token !== req.token);
        await req.profesor.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

// Habilitar Docente
router.patch('/docente/:id_docente/habilitarDocente', directorOrAdministratorAuth, async (req, res) => {
    try {
        const profesor = await Profesor.findOneAndUpdate(
            { _id: req.params.id_docente },
            { habilitado: true },
            { new: true } // Devolver el objeto actualizado en la respuesta
        );

        if (!profesor) {
            return res.status(404).send();
        }

        res.send(profesor);
    } catch (e) {
        res.status(500).send();
    }
});

// Deshabilitar Docente: Director y Administrador
router.patch('/docente/:id_docente/deshabilitarDocente', directorOrAdministratorAuth, async (req, res) => {
    try {
        const profesor = await Profesor.findOneAndUpdate(
            { _id: req.params.id_docente },
            { habilitado: false },
            { new: true } // Devolver el objeto actualizado en la respuesta
        );

        if (!profesor) {
            return res.status(404).send();
        }

        res.send(profesor);
    } catch (e) {
        res.status(500).send();
    }
});

// Retirar Sección Docente
router.patch('/docente/:id_docente/retirarSeccion', async (req, res) => {
    try {
        const profesor = await Profesor.findOneAndUpdate(
            { _id: req.params.id_docente },
            { section: null },
            { new: true } // Devolver el objeto actualizado en la respuesta
        );

        if (!profesor) {
            return res.status(404).send();
        }

        res.send(profesor);
    } catch (e) {
        res.status(500).send();
    }
});

// Asignar Sección Docente
router.patch('/docente/:id_docente/asignarSeccion', async (req, res) => {
    try {
        const profesor = await Profesor.findOneAndUpdate(
            { _id: req.params.id_docente },
            { section: req.body.section },
            { new: true } // Devolver el objeto actualizado en la respuesta
        );

        if (!profesor) {
            return res.status(404).send();
        }

        res.send(profesor);
    } catch (e) {
        res.status(500).send();
    }
});

// Ver lista de Docentes: Director y Administrador
router.get('/docentes', directorOrAdministratorAuth, async (req, res) => {
    try {
        const profesores = await Profesor.find();
        res.send(profesores);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error al obtener la lista de docentes' });
    }
});

// Ver Docente: Director y Administrador
router.get('/docentes/:id_docente', directorOrAdministratorAuth, async (req, res) => {
    try {
        const profesor = await Profesor.findById(req.params.id_docente);
        res.send(profesor);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error al obtener la lista de docentes' });
    }
});

// Ver estudiantes del profesor
router.get('/profesor/estudiantes', professorAuth, async (req, res) => {
    try {

        // Buscar todos los estudiantes que pertenecen a la misma sección que el profesor
        const lista_estudiantes = await Representante.find({ "hijos_estudiantes.hijo_estudiante.seccion": req.profesor.section });

        let lista = [];

        lista_estudiantes.forEach(representante => {
            representante.hijos_estudiantes.forEach(estudiante => {
                lista.push({
                    ...estudiante.hijo_estudiante,
                    _id: estudiante._id,
                    id_representante: representante._id
                });
            });
        });

        res.send(lista);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error al obtener la lista de estudiantes del profesor' });
    }
});

module.exports = router;
