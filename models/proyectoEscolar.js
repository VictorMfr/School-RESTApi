// models/proyectoEscolar.js
const mongoose = require('mongoose');

const proyectoEscolarSchema = new mongoose.Schema({
  docente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor',
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  lapso: {
    type: Number,
    required: true
  }
});

const ProyectoEscolar = mongoose.model('ProyectoEscolar', proyectoEscolarSchema);
module.exports = ProyectoEscolar;
