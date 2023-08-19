// Importar librerias
const express = require('express')

// Iniciar Base de datos
require('./db/mongoose')

// Iniciar rutas
const directorRouter = require('./routers/director');
const administratorRouter = require("./routers/administrator");
const professorRouter = require("./routers/professor");
const representantRouter = require("./routers/representant");

// Iniciar Express
const app = express();

//Configurar Express
app.use(express.json())
app.use(directorRouter) // RUTAS ACTOR DIRECTOR
app.use(administratorRouter) // RUTAS ACTOR ADMINISTRADOR
app.use(professorRouter) // RUTAS ACTOR DOCENTE
app.use(representantRouter) // RUTAS ACTOR REPRESENTANTE

const port = process.env.PORT || 3000;

// Inicio Express
app.listen(port, () => {
    console.log('Servidor iniciado en puerto ' + port)
})