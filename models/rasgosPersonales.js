// models/rasgosPersonales.js
const mongoose = require('mongoose');

const rasgosPersonalesSchema = new mongoose.Schema({
  docente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor',
    required: true
  },
  lapso: {
    type: Number,
    required: true
  },
  rasgos: {
    type: String,
    required: true
  }
});

const RasgosPersonales = mongoose.model('RasgosPersonales', rasgosPersonalesSchema);
module.exports = RasgosPersonales;
