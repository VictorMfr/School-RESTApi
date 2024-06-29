// Importar librerías
const express = require('express')
const cors = require("cors");

// Iniciar Base de datos
require('./db/mongoose')

// Iniciar rutas
const directorRouter = require('./routers/director');
const administratorRouter = require("./routers/administrator");
const professorRouter = require("./routers/professor");
const representantRouter = require("./routers/representant");
const personalTraitRouter = require("./routers/personalTrait");

// Iniciar Express
const app = express();

// Configurar Express
app.use(express.json());
app.use(cors({
    origin: "https://escuela-frontend.netlify.app",
    credentials: true
}));

app.use(directorRouter); // RUTAS ACTOR DIRECTOR
app.use(administratorRouter); // RUTAS ACTOR ADMINISTRADOR
app.use(professorRouter); // RUTAS ACTOR DOCENTE
app.use(representantRouter); // RUTAS ACTOR REPRESENTANTE
app.use(personalTraitRouter);

const port = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
    // Iniciar Express solo si no estamos en el entorno de pruebas
    app.listen(port, () => {
        console.log('Servidor iniciado en puerto ' + port);
    });
}

module.exports = app; // Exportar la instancia de la aplicación
