// routers/rasgosPersonalesRouter.js
const express = require('express');
const rasgosPersonalesController = require('../controllers/rasgosPersonalesController');
const professorAuth = require('../middleware/professorAuth');
const administratorAuth = require('../middleware/administratorAuth');
const router = new express.Router();

// Ruta para establecer los rasgos personales por un docente o administrador autenticado
router.post('/rasgosPersonales/establecerRasgos', professorAuth, administratorAuth, rasgosPersonalesController.establecerRasgosPersonales);

module.exports = router;
