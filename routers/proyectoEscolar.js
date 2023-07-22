// routers/proyectoEscolarRouter.js
const express = require('express');
const proyectoEscolarController = require('../controllers/proyectoEscolarController');
const professorAuth = require('../middleware/professorAuth');
const administratorAuth = require('../middleware/administratorAuth');
const router = new express.Router();

// Ruta para registrar el nombre del proyecto escolar por un docente o administrador autenticado
router.post('/proyectoEscolar/registrarProyecto', professorAuth, administratorAuth, proyectoEscolarController.registrarProyectoEscolar);

module.exports = router;
