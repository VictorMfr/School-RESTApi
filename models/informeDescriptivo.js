const mongoose = require('mongoose');

const informeDescriptivoSchema = new mongoose.Schema({
  docente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor',
    required: true
  },
  lapso: {
    type: Number,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  }
});

const InformeDescriptivo = mongoose.model('InformeDescriptivo', informeDescriptivoSchema);
module.exports = InformeDescriptivo;
