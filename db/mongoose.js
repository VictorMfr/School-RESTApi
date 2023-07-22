const mongoose = require('mongoose');

// Conectandose a la base de datos
mongoose.connect("mongodb://" + process.env.MONGODB_URL + "/escuelaBaseDeDatos", {
    useNewUrlParser: true,
}).then(()=> {
    console.log('Conectado a la base de datos');
}).catch((error) => {
    console.log('Error al conectarse a la base de datos', error);
})