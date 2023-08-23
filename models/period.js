const mongoose = require('mongoose');

// Sub-schema para la lista de estudiantes
const studentSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  apellido: {
    type: String,
    required: true
  },
  rasgosPersonales: [String]
});

// Sub-schema para la sección
const sectionSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
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
    unique: true
  },
  ProyectoEscolar: {
    type: String,
    required: true
  },
  grados: [gradeSchema],  // Lista de grados en el lapso
});

// Schema para los periodos
const periodSchema = new mongoose.Schema({
  Periodo: {
    type: String,
    required: true
  },
  fechaInicio: {
    type: String,
    required: true
  },
  fechaCulminación: {
    type: String,
    required: true
  },
  lapsos: [lapsoSchema]  // Lista de lapsos en el periodo
});

const Periodo = mongoose.model('Periodo', periodSchema);
module.exports = Periodo;

/*
  Ejemplo Entregable
  
  [{
    Periodo: 2019-2020
    lapsos: {
      Uno: {
        grados: {
          Primero: {
            Secciones: {
              A: {
                Estudiantes: [{
                  nombre: Víctor,
                  apellido: Martínez,
                  Calificativo: A,
                  Rasgos Personales: {
                    Disciplina: Si,
                    Respeto: No,
                    Atento: No,
                    Violento: No,
                  }


                }]
              },
              B: {

              },
              C: {

              }
            }
          },
          Segundo: {
            ...
          },
          Tercero: {
            ...
          },
          Cuarto: {
            ...
          }
        }
      } 
      Dos: {...} 
      Tres: {...}
    }
  },
  ...
  ]


  Hay infinitos Periodos
  Hay infinitos Lapsos
  Hay infinitos Grados
  Hay infinitos Secciones
  Hay infinitos Estudiantes
*/
