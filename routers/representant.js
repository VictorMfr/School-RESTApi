// Importando Librerias
const express = require('express');
const {handleError, serverRoutes} = require('../utils/utils');

// Importando modelos
const Representante = require('../models/representant');

// Importando Middlewares
const auth = require("../middleware/auth");

// Inicializando Router
const router = new express.Router();



// Registro de representante: Director y Administrador
router.post(serverRoutes.representant.newRepresentant, auth, async (req, res) => {
  const representante = new Representante(req.body);
  try {

    if (!req.director && !req.administrador) {
      throw new Error("Acceso Denegado")
    }

    await representante.save();
    res.status(201).send({ representante });
  } catch (error) {
    console.log(error.message)
    res.status(500).send({ error: error.message });
  }
});

// Inicio de sesion de representante
router.post(serverRoutes.representant.login, async (req, res) => {
  try {

    const representante = await Representante.findByCredentials(req.body.email, req.body.password)
    const token = await representante.generateAuthToken()
    res.send({ representante, token })
  } catch (error) {
    console.log(error.message)
    res.status(500).send({ error: error.message });
  }
})

// Cerrar sesion representante
router.post(serverRoutes.representant.logout, auth, async (req, res) => {
  try {

    if (!req.representante) {
      throw new Error("Acceso Denegado")
    }

    req.representante.tokens = req.representante.tokens.filter((token) => {
      return token.token !== req.token
    })

    await req.representante.save()

    res.send()
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: error.message });
  }
})

// Borrar Representante: Director y Administrador
router.delete(serverRoutes.representant.deleteRepresentant, auth, async (req, res) => {
  try {

    if (!req.director && !req.administrador) {
      throw new Error("Acceso Denegado")
    }

    const representante = await Representante.findOneAndDelete({ _id: req.params.id_representante })
    res.send(representante);
  } catch (error) {
    console.log(error.message)
    res.status(500).send({ error: error.message });
  }
})

// Editar informacion representante: Director y Administrador
router.patch(serverRoutes.representant.editRepresentant, auth, async (req, res) => {

  // Verificar si los campos del body son válidos
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' })
  }

  try {

    if (!req.director && !req.administrador) {
      throw new Error("Acceso Denegado")
    }

    // Verificar si existe el representante
    const representante = await Representante.findOne({ _id: req.params.id_representante });

    if (!representante) {
      throw new Error('El representante no existe');
    }

    // Realizar las actualizaciones
    updates.forEach((update) => req.representante[update] = req.body[update])
    await req.representante.save()

    res.send(req.representante)
  } catch (error) {
    console.log(error.message)
    res.status(500).send({ error: error.message });
  }
})

// Añadir Estudiante
router.patch(serverRoutes.representant.student.addStudent, auth, async (req, res) => {
  // Extrayendo datos de la petición
  const datos_hijo = {
    nombres: req.body.nombres,
    apellidos: req.body.apellidos,
    fecha_de_nacimiento: req.body.fecha_de_nacimiento,
    edad: req.body.edad,
    direccion: req.body.direccion,
    cedula_escolar: req.body.cedula_escolar,
    año_escolar: req.body.año_escolar,
  };

  try {

    // Verificar si es Director
    if (!req.director && !req.administrador) {
      throw new Error("Acceso Denegado")
    }

    // Verificar si el representante existe
    const representante = await Representante.findById(req.params.id_representante);

    if (!representante) {
      throw new Error("No existe dicho representante")
    }

    // Verificar si la cedula escolar ya existe
    const representantes = await Representante.find();
    let estudiantes = [];
    
    representantes.forEach(representante => {
      representante.hijos_estudiantes.forEach(estudiante => {
        estudiantes.push({ ...estudiante.hijo_estudiante, _id: estudiante._id, id_representante: representante._id });
      });
    });

    if (estudiantes.find(est => est.cedula_escolar === datos_hijo.cedula_escolar)) {
      throw new Error("La cedula escolar debe ser unica")
    }

    // Añadir los datos del hijo al representante
    representante.hijos_estudiantes.push({ hijo_estudiante: datos_hijo });
    await representante.save();
    res.send(representante);
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: error.message });
  }
});

// Ver lista de Estudiantes del representante: Representante
router.get(serverRoutes.representant.student.seeStudents, auth, async (req, res) => {
  try {

    if (!req.representante) {
      throw new Error("Acceso Denegado")
    }

    // Buscar todos los administradores en la base de datos
    const representanteEstudiantes = await Representante.findById(req.params.id_representante).hijos_estudiantes;
    res.send(representanteEstudiantes);

  } catch (error) {
    console.log(error.message)
    res.status(500).send({ error: error.message });
  }
});

// Ver lista de todos los estudiantes: Director y administrador
router.get(serverRoutes.representant.student.seeAllStudents, async (req, res) => {
  try {
    if (!req.director && req.administrator) {
      throw new Error("Acceso Denegado")
    }

    // Buscar todos los representantes en la base de datos
    const representantes = await Representante.find();

    // Crear un arreglo para almacenar los estudiantes de todos los representantes
    let estudiantes = [];
    // Iterar sobre los representantes y obtener los estudiantes de cada uno
    representantes.forEach(representante => {
      representante.hijos_estudiantes.forEach(estudiante => {
        estudiantes.push({ ...estudiante.hijo_estudiante, _id: estudiante._id, id_representante: representante._id });
      });
    });

    res.send(estudiantes);
  } catch (error) {
    console.log(error.message)
    res.status(500).send({ error: error.message });
  }
});

// Mover Seccion estudiante: Director y Administrador
router.patch(serverRoutes.representant.student.transferSectionStudent, auth, async (req, res) => {

  try {

    if (!req.director && !req.administrador) {
      throw new Error("Acceso Denegado")
    }

    // Verificar si existe el representante
    const representante = await Representante.findOne({ _id: req.params.id_representante });

    if (!representante) {
      throw new Error('El representante no existe');
    }

    const estudianteId = req.params.id_estudiante;
    const nuevaSeccion = req.body.seccion;

    representante.hijos_estudiantes.find(hijo => hijo._id.toString() === estudianteId).hijo_estudiante.seccion = nuevaSeccion;

    await representante.save()

    res.send({ message: 'Sección del estudiante actualizada exitosamente' });
  } catch (error) {
    console.log(error.message)
    res.status(500).send({ error: error.message });
  }
});

// Editar Estudiante
router.patch(serverRoutes.representant.student.editStudent, auth, async (req, res) => {

  const estudianteId = req.params.id_estudiante;

  try {

    if (!req.director && !req.administrador) {
      throw new Error("Acceso Denegado")
    }

    // Verificar si existe el representante
    const representante = await Representante.findOne({ _id: req.params.id_representante });

    if (!representante) {
      throw new Error('El representante no existe');
    }



    // Buscar el estudiante dentro de la lista hijos_estudiantes del representante
    const estudiante = representante.hijos_estudiantes.find(hijo => hijo._id.toString() === estudianteId);

    if (!estudiante) {
      return res.status(404).send({ error: 'Estudiante no encontrado en la lista del representante' });
    }

    // Actualizar solo los campos proporcionados en el cuerpo de la solicitud
    for (const campo in req.body) {
      if (campo in estudiante.hijo_estudiante) {
        estudiante.hijo_estudiante[campo] = req.body[campo];
      }
    }

    // Guardar los cambios en el representante
    await representante.save();

    res.send({ message: 'Datos del estudiante actualizados exitosamente' });
  } catch (error) {
    console.log(error.message)
    res.status(500).send({ error: error.message });
  }
});

// Retirar Seccion Estudiante
router.patch(serverRoutes.representant.student.removeSection, auth, async (req, res) => {

  const estudianteId = req.params.id_estudiante;

  try {

    if (!req.director && !req.administrador) {
      throw new Error("Acceso Denegado")
    }

    // Verificar si existe el representante
    const representante = await Representante.findOne({ _id: req.params.id_representante });

    if (!representante) {
      throw new Error('El representante no existe');
    }


    // Buscar el estudiante dentro de la lista hijos_estudiantes del representante
    const estudiante = representante.hijos_estudiantes.find(hijo => hijo._id.toString() === estudianteId);

    if (!estudiante) {
      return res.status(404).send({ error: 'Estudiante no encontrado en la lista del representante' });
    }

    // Retirar la sección, asignando null al campo "seccion" del estudiante
    estudiante.hijo_estudiante.seccion = "ninguno";

    // Guardar los cambios en el representante
    await representante.save();

    res.send({ message: 'Sección del estudiante retirada exitosamente' });
  } catch (error) {
    console.log(error.message)
    res.status(500).send({ error: error.message });
  }
});

// Registrar Literal Calificativo Final: Docente
router.patch(serverRoutes.representant.student.addFinalNote, auth, async (req, res) => {
  try {

    if (!req.professor) {
      throw new Error("Acceso Denegado")
    }

    const representante = req.representante;
    const estudianteId = req.params.id_estudiante;
    const literalCalificativoFinal = req.body.literal_calificativo_final;

    // Buscar el estudiante dentro de la lista hijos_estudiantes del representante
    const estudiante = representante.hijos_estudiantes.find(hijo => hijo._id.toString() === estudianteId);

    if (!estudiante) {
      return res.status(404).send({ error: 'Estudiante no encontrado en la lista del representante' });
    }

    // Asignar el literal calificativo final al estudiante
    estudiante.hijo_estudiante.literal_calificativo_final = literalCalificativoFinal;

    // Guardar los cambios en el representante
    await representante.save();

    res.send({ message: 'Literal calificativo final registrado exitosamente' });
  } catch (error) {
    console.log(error.message)
    res.status(500).send({ error: error.message });
  }
});

// Ver lista de representantes: Director y Administrador
router.get(serverRoutes.representant.seeRepresentants, auth, async (req, res) => {
  try {

    if (!req.director && !req.administrador) {
      throw new Error("Acceso Denegado")
    }

    // Buscar todos los representantes en la base de datos
    const representantes = await Representante.find();

    res.send(representantes);
  } catch (error) {
    console.log(error.message)
    res.status(500).send({ error: error.message });
  }
});

// Ver representante: Director y Administrador
router.get('/representantes/:id_representante', auth, async (req, res) => {
  try {

    if (!req.director && !req.administrador) {
      throw new Error("Acceso Denegado")
    }

    // Buscar administrador en la base de datos por ID
    const representante = await Representante.findById(req.params.id_administrador);

    if (!representante) {
      return res.status(404).send();
    }

    res.send(representante);
  } catch (error) {
    console.log(error.message)
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;