const mongoose = require('mongoose');

// Conectándose a la base de datos
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
}).then(() => {
    console.log('Conectado a la base de datos');
}).catch((error) => {
    console.log('Error al conectarse a la base de datos', error);
});
