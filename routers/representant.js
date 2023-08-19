const express = require('express');
const directorOrAdministratorAuth = require('../middleware/directorOrAdministratorAuth');
const Representante = require('../models/representant');
const representanteAuth = require('../middleware/representanteAuth');
const RepresentanteControlAuth = require('../middleware/representanteControlAuth');
const router = new express.Router();

// Registro de representante: Director y Administrador
router.post('/representante/nuevoRepresentante', directorOrAdministratorAuth, async (req, res) => {
  const representante = new Representante(req.body);
  try {
    await representante.save();
    res.status(201).send({ representante });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Inicio de sesion de representante
router.post('/representante/iniciarSesion', async (req, res) => {
  try {
    const representante = await Representante.findByCredentials(req.body.email, req.body.password)
    const token = await representante.generateAuthToken()
    res.send({ representante, token })
  } catch (e) {
    res.status(400).send(e)
  }
})

// Cerrar sesion representante
router.post('/representante/cerrarSesion', representanteAuth, async (req, res) => {
  try {
    req.representante.tokens = req.representante.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.representante.save()

    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

// Borrar Representante: Director y Administrador
router.delete('/representante/:id_representante/eliminarRepresentante', directorOrAdministratorAuth, async (req, res) => {
  try {
    const representante = await Representante.findOneAndDelete({ _id: req.params.id_representante })
    res.send(representante);
  } catch (e) {
    res.status(500).send()
  }
})

// Editar informacion representante
router.patch('/representante/:id_representante', directorOrAdministratorAuth, RepresentanteControlAuth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' })
  }

  /// intenta editar la informacion del representante siendo Director o Administrador
  try {
    updates.forEach((update) => req.representante[update] = req.body[update])
    await req.representante.save()
    res.send(req.representante)
  } catch (e) {
    console.log(e);
    res.status(400).send(e)
  }
})

// Añadir Estudiante
router.patch("/representante/:id_representante/nuevoEstudiante", RepresentanteControlAuth, directorOrAdministratorAuth, async (req, res) => {
  // Extrayendo datos de la petición
  const datos_hijo = {
    nombres: req.body.nombres,
    apellidos: req.body.apellidos,
    fecha_de_nacimiento: req.body.fecha_de_nacimiento,
    edad: req.body.edad,
    grado: req.body.grado,
    seccion: req.body.seccion,
    direccion: req.body.direccion,
    docente: req.body.docente,
    cedula_escolar: req.body.cedula_escolar,
    año_escolar: req.body.año_escolar
  };

  try {
    // Añadir los datos del hijo al representante
    req.representante.hijos_estudiantes.push({ hijo_estudiante: datos_hijo });
    await req.representante.save();
    res.send(req.representante);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al guardar los datos del estudiante en el representante.");
  }
});

// Ver lista de Estudiantes del representante: Representante
router.get('/representante/:id_representante', representanteAuth, async (req, res) => {
  try {
    // Buscar todos los administradores en la base de datos
    const representanteEstudiantes = await Representante.findById(req.params.id_representante).hijos_estudiantes;
    res.send(representanteEstudiantes);

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: 'Error al obtener la lista de docentes' });
  }
});

// Ver lista de todos los estudiantes: Director y administrador
router.get("/direccion/estudiantes", async (req, res) => {
  try {
    // Buscar todos los representantes en la base de datos
    const representantes = await Representante.find();

    // Crear un arreglo para almacenar los estudiantes de todos los representantes
    let estudiantes = [];

    // Iterar sobre los representantes y obtener los estudiantes de cada uno
    representantes.forEach(representante => {
      representante.hijos_estudiantes.forEach((estudiante, i) => {
        estudiantes.push({
          ...estudiante.hijo_estudiante,
          _id: estudiante._id,
          id_representante: representante._id
        });
      });
    });

    res.send(estudiantes);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: 'Error al obtener la lista de estudiantes' });
  }
});

// Mover Seccion estudiante
router.patch('/representante/:id_representante/estudiante/:id_estudiante/moverSeccion', RepresentanteControlAuth, directorOrAdministratorAuth, async (req, res) => {
  try {

    // Constantes faciles
    const representante = req.representante;
    const estudianteId = req.params.id_estudiante;
    const nuevaSeccion = req.body.seccion;

    representante.hijos_estudiantes.find(hijo => hijo._id.toString() === estudianteId).hijo_estudiante.seccion = nuevaSeccion;

    await representante.save()

    res.send({ message: 'Sección del estudiante actualizada exitosamente' });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: 'Error al actualizar la sección del estudiante' });
  }
});

// Editar Estudiante
router.patch('/representante/:id_representante/estudiante/:id_estudiante/editarEstudiante', RepresentanteControlAuth, directorOrAdministratorAuth, async (req, res) => {
  try {
    const representante = req.representante;
    const estudianteId = req.params.id_estudiante;

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
    console.log(error);
    res.status(500).send({ error: 'Error al actualizar los datos del estudiante' });
  }
});

// Retirar Seccion Estudiante
router.patch('/representante/:id_representante/estudiante/:id_estudiante/retirarSeccion', RepresentanteControlAuth, directorOrAdministratorAuth, async (req, res) => {
  try {
    const representante = req.representante;
    const estudianteId = req.params.id_estudiante;

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
    console.log(error);
    res.status(500).send({ error: 'Error al retirar la sección del estudiante' });
  }
});

// Registrar Literal Calificativo Final: Director y Administrador
router.patch('/representante/:id_representante/estudiante/:id_estudiante/registrarLiteralFinal', directorOrAdministratorAuth, async (req, res) => {
  try {
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
    console.log(error);
    res.status(500).send({ error: 'Error al registrar el literal calificativo final' });
  }
});

// Ver lista de representantes: Director y Administrador
router.get('/representantes', directorOrAdministratorAuth, async (req, res) => {
  try {
    // Buscar todos los representantes en la base de datos
    const representantes = await Representante.find();

    res.send(representantes);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: 'Error al obtener la lista de representantes' });
  }
});

module.exports = router;