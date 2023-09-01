const mongoose = require('mongoose');
const validator = require('validator');

// Sub-schema para la lista de estudiantes
const studentSchema = new mongoose.Schema({
  // Nombre del Estudiante
  nombre: {
    type: String,
    required: true
  },

  // Apellido del estudiante
  apellido: {
    type: String,
    required: true
  },

  // Cedula del estudiante
  cedula_escolar: {
    type: String,
    required: true
  },

  // Informe Descriptivo del estudiante al final del lapso
  informe_descriptivo: {
    type: String,
  },

  // Literal calificativo al final del lapso
  literal_calificativo_final: {
    type: String,
  },

  // Rasgos personales al final del lapso
  rasgos: {
    creativo: {
      type: Boolean,
      default: false,
    },
    responsable: {
      type: Boolean,
      default: false,
    },
    colaborador: {
      type: Boolean,
      default: false,
    },
    // ... Agrega más rasgos aquí si es necesario
  }
});

// Sub-schema para la sección
const sectionSchema = new mongoose.Schema({
  seccion: {
    type: String,
    required: true
  },
  docente: {
    type: String,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Invalid email');
      }
    }
  },
  estudiantes: [studentSchema]  // Lista de estudiantes en la sección
});

// Sub-schema para el grado
const gradeSchema = new mongoose.Schema({
  grado: {
    type: Number,
    required: true
  },
  secciones: [sectionSchema]  // Lista de secciones en el grado
});

// Schema principal para los lapsos
const lapsoSchema = new mongoose.Schema({
  lapso: {
    type: Number,
    required: true,
  },
  proyectoEscolar: {
    type: String,
    required: true
  },
  grados: [gradeSchema],  // Lista de grados en el lapso
});

// Schema para los periodos
const periodSchema = new mongoose.Schema({
  periodo: {
    type: String,
    required: true
  },
  fechaInicio: {
    type: String,
    required: true
  },
  fechaCulminacion: {
    type: String,
    required: true
  },
  lapsos: [lapsoSchema]  // Lista de lapsos en el periodo
});

const Periodo = mongoose.model('Periodo', periodSchema);
module.exports = Periodo;
