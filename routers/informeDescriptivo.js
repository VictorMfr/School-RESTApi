// routers/informeDescriptivoRouter.js
const express = require('express');
const informeDescriptivoController = require('../controllers/informeDescriptivoController');
const professorAuth = require('../middleware/professorAuth');
const router = new express.Router();

// Ruta para cargar el informe descriptivo por un docente autenticado
router.post('/informeDescriptivo/cargarInforme', professorAuth, informeDescriptivoController.cargarInformeDescriptivo);

// Ruta mostrar informe descriptivo


module.exports = router;
