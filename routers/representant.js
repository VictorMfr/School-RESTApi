// Importando Librerias
const express = require('express');
const { handleError, serverRoutes, checkAuths } = require('../utils/utils');

// Importando modelos
const Representante = require('../models/representant');

// Importando Middlewares
const auth = require("../middleware/auth");

// Inicializando Router
const router = new express.Router();


// Registro de representante: Solo Director y Administrador
router.post(serverRoutes.representant.newRepresentant, auth, async (req, res) => {
  try {
    // Verificando si se trata de un Director o Administrador
    checkAuths.checkIfAuthDirectorOrAdministrator(req)

    // Creando Representante
    const representante = new Representante(req.body);

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
    handleError(error, res)
  }
})

// Cerrar sesion representante: Solo Representante
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
    handleError(error, res)
  }
})

// Borrar Representante: Solo Director y Administrador
router.delete(serverRoutes.representant.deleteRepresentant, auth, async (req, res) => {
  try {
    // Verificando si se trata de un Director o Administrador
    checkAuths.checkIfAuthDirectorOrAdministrator(req)

    const representante = await Representante.findOneAndDelete({ _id: req.params.id_representante });

    res.send(representante);
  } catch (error) {
    handleError(error, res)
  }
})

// Editar informacion representante: Solo Director y Administrador
router.patch(serverRoutes.representant.editRepresentant, auth, async (req, res) => {
  try {
    // Verificando si se trata de un Director o Administrador
    checkAuths.checkIfAuthDirectorOrAdministrator(req)

    // Verificar si los campos del body son válidos
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' })
    }

    // Verificar si existe el representante
    let representante = await Representante.findById(req.params.id_representante);

    if (!representante) {
      throw new Error('El representante no existe');
    }


    // Realizar las actualizaciones
    updates.forEach((update) => representante[update] = req.body[update])

    await representante.save()
    res.send({ message: "El Representante ha sido actualizado correctamente" })
  } catch (error) {
    handleError(error, res)
  }
})

// Añadir Estudiante: Solo Director y Administrador
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
    // Verificando si se trata de un Director o Administrador
    checkAuths.checkIfAuthDirectorOrAdministrator(req)

    // Verificar si el representante existe
    const representante = await Representante.findById(req.params.id_representante);

    if (!representante) {
      throw new Error("No existe dicho representante")
    }

    // Verificar si la cedula escolar ya existe
    const representantes = await Representante.find();
    let estudiantes = [];

    // Buscar entre los representantes
    representantes.forEach(representante => {
      representante.hijos_estudiantes.forEach(estudiante => {
        estudiantes.push({ ...estudiante.hijo_estudiante, _id: estudiante._id, id_representante: representante._id });
      });
    });

    if (estudiantes.find(est => est.cedula_escolar == datos_hijo.cedula_escolar)) {
      throw new Error("La cedula escolar debe ser unica")
    }

    // Añadir los datos del hijo al representante
    representante.hijos_estudiantes.push({ hijo_estudiante: datos_hijo });
    await representante.save();
    res.send(representante);
  } catch (error) {
    handleError(error, res)
  }
});

// Ver lista de Estudiantes del representante
router.get(serverRoutes.representant.student.seeStudents, auth, async (req, res) => {
  try {

    // Obtener la lista de estudiantes del representante a traves de req.representnate
    const representante = req.representante;

    // Accediendo a una lista de estudiantes hijos
    let estudiantes_hijos = representante.hijos_estudiantes.map(est => {
      return { ...est.hijo_estudiante, _id: est._id }
    })

    // Si no existe lapso, o bien grados, o bien secciones
    if (!req.lapso || (req.lapso && !req.lapso.grados) || (req.lapso && req.lapso.grados && req.lapso.grados[0].secciones)) {
      return res.send({ message: estudiantes_hijos });
    }

    // Ahora es necesario obtener la id del estudiante del periodo
    estudiantes_hijos = estudiantes_hijos.map(est => {
      // Para cada estudiante se debe tomar la cedula escolar y buscarla en periodo
      const cedula_escolar = est.cedula_escolar;

      // Buscar estudiante en Periodo
      const estudianteEnPeriodoGrado = req.lapso.grados.find(grado => {
        return grado.secciones.find(seccion => {
          return seccion.estudiantes.find(est => est.cedula_escolar == cedula_escolar)
        })
      })

      const estudianteEnPeriodoSeccion = estudianteEnPeriodoGrado.secciones.find(seccion => {
        return seccion.estudiantes.find(est => est.cedula_escolar == cedula_escolar)
      })

      const estudianteEnPeriodo = estudianteEnPeriodoSeccion.estudiantes.find(est => est.cedula_escolar == cedula_escolar)

      console.log({
        ...est,
        _id: estudianteEnPeriodo._id
      })

      return {
        ...est,
        _id: estudianteEnPeriodo._id
      }
    })


    res.send({ message: estudiantes_hijos });



  } catch (error) {
    handleError(error, res)
  }
});

// Ver lista de todos los estudiantes: Solo Director y Administrador
router.get(serverRoutes.representant.student.seeAllStudents, auth, async (req, res, next) => {
  try {
    const representantes = await Representante.find();

    // Crear un arreglo para almacenar los estudiantes de todos los representantes
    let estudiantes = [];
    // Iterar sobre los representantes y obtener los estudiantes de cada uno
    representantes.forEach(representante => {
      representante.hijos_estudiantes.forEach(estudiante => {
        estudiantes.push({ ...estudiante.hijo_estudiante, _id: estudiante._id, id_representante: representante._id, static: req.lapso ? false : true });
      });
    });

    const isStatic = (!req.lapso) || (req.lapso && (req.lapso.grados.length == 0)) || (req.lapso && (req.lapso.grados.length > 0) && req.lapso.grados[0] && (req.lapso.grados[0].secciones.length == 0))

    // Primer periodo
    if (isStatic) {
      return res.send(estudiantes);
    }

    let estudiantesEnPeriodo = [];
    let estudiantesEnPeriodoFlag = false; // Variable de control

    for (const est of estudiantes) {
      const cedula = est.cedula_escolar;

      // Buscar estudiante en Periodo
      const estudianteEnPeriodoGrado = req.lapso.grados.find(grado => {
        return grado.secciones.find(seccion => {
          return seccion.estudiantes.find(est => est.cedula_escolar == cedula)
        })
      });

      if (!estudianteEnPeriodoGrado) {
        estudiantesEnPeriodoFlag = true; // Establecer la bandera en verdadero
        break; // Salir del bucle
      }

      const estudianteEnPeriodoSeccion = estudianteEnPeriodoGrado.secciones.find(seccion => {
        return seccion.estudiantes.find(est => est.cedula_escolar == cedula)
      });

      const estudianteEnPeriodo = estudianteEnPeriodoSeccion.estudiantes.find(est => est.cedula_escolar == cedula)

      estudiantesEnPeriodo.push({
        ...est,
        _id: estudianteEnPeriodo._id
      });
    }

    // Verificar la bandera y responder en consecuencia
    if (estudiantesEnPeriodoFlag) {
      return res.send(estudiantes);
    }

    //await getDatosEstudianteEnPeriodo(req.periodo, req.lapso, )

    res.send(estudiantesEnPeriodo);
  } catch (error) {
    handleError(error, res);
  }
});


// Mover Seccion estudiante: Solo Director y Administrador
router.patch(serverRoutes.representant.student.transferSectionStudent, auth, async (req, res) => {
  try {
    // Verificando si se trata de un Director o Administrador
    checkAuths.checkIfAuthDirectorOrAdministrator(req)

    // Verificar si existe el representante
    const representante = await Representante.findOne({ _id: req.params.id_representante });

    if (!representante) {
      throw new Error('El representante no existe');
    }

    const estudianteId = req.params.id_estudiante;
    const nuevaSeccion = req.body.seccion;

    // Hacer el cambio en la tabla estatica
    // tengo la id del periodo

    // Buscar estudiante en Periodo
    const estudianteEnPeriodoGrado = req.lapso.grados.find(grado => {
      return grado.secciones.find(seccion => {
        return seccion.estudiantes.find(est => est._id == estudianteId)
      })
    })

    let estudianteEnPeriodoSeccion = estudianteEnPeriodoGrado.secciones.find(seccion => {
      return seccion.estudiantes.find(est => est._id.toString() == estudianteId)
    })

    const estudianteEnPeriodo = estudianteEnPeriodoSeccion.estudiantes.find(est => est._id.toString() == estudianteId)

    // Tomar la cédula y buscar el estudiante en la tabla estatica en base a su cedula
    const cedulaEstudiante = estudianteEnPeriodo.cedula_escolar;

    // Hacer los cambios
    representante.hijos_estudiantes.find(hijo => hijo.hijo_estudiante.cedula_escolar.toString() == cedulaEstudiante).hijo_estudiante.seccion = nuevaSeccion;
    await representante.save();

    // Remover el estudiante de la seccion en el que está
    const lapsoIndex = req.periodo.lapsos.length - 1;
    const gradoIndex = req.periodo.lapsos[lapsoIndex].grados.findIndex(grad => grad.grado == estudianteEnPeriodoGrado.grado)
    const seccionIndex = req.periodo.lapsos[lapsoIndex].grados[gradoIndex].secciones.findIndex(sec => sec.seccion == estudianteEnPeriodoSeccion.seccion)
    
    req.periodo.lapsos[lapsoIndex].grados[gradoIndex].secciones[seccionIndex].estudiantes = req.periodo.lapsos[lapsoIndex].grados[gradoIndex].secciones[seccionIndex].estudiantes.filter(est => est.cedula_escolar !== cedulaEstudiante);

    // Asignarlo en la nueva seccion
    const nuevaSeccionIndex = estudianteEnPeriodoGrado.secciones.findIndex(sec => sec.seccion == nuevaSeccion);
    req.periodo.lapsos[lapsoIndex].grados[gradoIndex].secciones[nuevaSeccionIndex].estudiantes = [...req.periodo.lapsos[lapsoIndex].grados[gradoIndex].secciones[nuevaSeccionIndex].estudiantes, estudianteEnPeriodo]
    
    // Guardar cambios
    await req.periodo.save();


    res.send({ message: 'Sección del estudiante actualizada exitosamente' });
  } catch (error) {
    handleError(error, res)
  }
});

// Editar Estudiante: Solo Director y Administrador
router.patch(serverRoutes.representant.student.editStudent, auth, async (req, res) => {

  const estudianteId = req.params.id_estudiante;

  try {
    // Verificando si se trata de un Director o Administrador
    checkAuths.checkIfAuthDirectorOrAdministrator(req)

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
    handleError(error, res)
  }
});

// Retirar Seccion Estudiante: Solo Director y Administrador
router.patch(serverRoutes.representant.student.removeSection, auth, async (req, res) => {
  try {
    // Verificando si se trata de un Director o Administrador
    checkAuths.checkIfAuthDirectorOrAdministrator(req)

    // Verificar si existe el representante
    const representante = await Representante.findOne({ _id: req.params.id_representante });

    if (!representante) {
      throw new Error('El representante no existe');
    }

    const estudianteId = req.params.id_estudiante;
    const nuevaSeccion = req.body.seccion;

    // Hacer el cambio en la tabla estatica
    // tengo la id del periodo

    // Buscar estudiante en Periodo
    const estudianteEnPeriodoGrado = req.lapso.grados.find(grado => {
      return grado.secciones.find(seccion => {
        return seccion.estudiantes.find(est => est._id == estudianteId)
      })
    })

    let estudianteEnPeriodoSeccion = estudianteEnPeriodoGrado.secciones.find(seccion => {
      return seccion.estudiantes.find(est => est._id.toString() == estudianteId)
    })

    const estudianteEnPeriodo = estudianteEnPeriodoSeccion.estudiantes.find(est => est._id.toString() == estudianteId)

    // Tomar la cédula y buscar el estudiante en la tabla estatica en base a su cedula
    const cedulaEstudiante = estudianteEnPeriodo.cedula_escolar;

    // Hacer los cambios
    representante.hijos_estudiantes.find(hijo => hijo.hijo_estudiante.cedula_escolar.toString() == cedulaEstudiante).hijo_estudiante.seccion = nuevaSeccion;
    await representante.save();

    // Remover el estudiante de la seccion en el que está
    const lapsoIndex = req.periodo.lapsos.length - 1;
    const gradoIndex = req.periodo.lapsos[lapsoIndex].grados.findIndex(grad => grad.grado == estudianteEnPeriodoGrado.grado)
    const seccionIndex = req.periodo.lapsos[lapsoIndex].grados[gradoIndex].secciones.findIndex(sec => sec.seccion == estudianteEnPeriodoSeccion.seccion)
    
    req.periodo.lapsos[lapsoIndex].grados[gradoIndex].secciones[seccionIndex].estudiantes = req.periodo.lapsos[lapsoIndex].grados[gradoIndex].secciones[seccionIndex].estudiantes.filter(est => est.cedula_escolar !== cedulaEstudiante);

    // Guardar cambios
    await req.periodo.save();


    res.send({ message: 'Sección del estudiante actualizada exitosamente' });
  } catch (error) {
    handleError(error, res)
  }
});

// Ver lista de representantes: Solo Director y Administrador
router.get(serverRoutes.representant.seeRepresentants, auth, async (req, res) => {
  try {
    // Verificando si se trata de un Director o Administrador
    checkAuths.checkIfAuthDirectorOrAdministrator(req)

    // Buscar todos los representantes en la base de datos
    const representantes = await Representante.find();

    res.send(representantes);
  } catch (error) {
    handleError(error, res)
  }
});

// Ver representante: Solo Director y Administrador
router.get(serverRoutes.representant.seeRepresentant, auth, async (req, res) => {
  try {

    // Buscar administrador en la base de datos por ID
    const representante = await Representante.findById(req.params.id_representante);

    if (!representante) {
      return res.status(404).send();
    }

    res.send(representante);
  } catch (error) {
    handleError(error, res)
  }
});



module.exports = router;