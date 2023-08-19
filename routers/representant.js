const express = require('express');
const Representante = require('../models/representant');
const auth = require("../middleware/auth");
const router = new express.Router();

/*
ESTAS SON LAS RUTAS RELACIONADAS CON EL REPRESENTANTE:

RUTAS BÁSICAS:

- CREAR REPRESENTANTE
- BORRAR REPRESENTANTE
- EDITAR INFORMACIÓN DEL REPRESENTANTE
- VER REPRESENTANTE ESPECÍFICO
- INICIAR SESIÓN REPRESENTANTE
- CERRAR SESIÓN REPRESENTANTE


ESPECÍFICOS:

- AÑADIR ESTUDIANTE
- VER LISTA DE ESTUDIANTES DEL REPRESENTANTE
- VER LISTA DE TODOS LOS ESTUDIANTES DE LA ESCUELA
- MOVER SECCIÓN ESTUDIANTE
- EDITAR INFORMACIÓN ESTUDIANTE
- RETIRAR SECCIÓN ESTUDIANTE
- REGISTRAR CALIFICATIVO FINAL ESTUDIANTE
- VER LISTA DE REPRESENTANTES

*/


// Registro de representante: Director y Administrador
router.post('/representante/nuevoRepresentante', auth, async (req, res) => {
  const representante = new Representante(req.body);
  try {

    if (!req.director || !req.administrador) {
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
router.post('/representante/iniciarSesion', async (req, res) => {
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
router.post('/representante/cerrarSesion', auth, async (req, res) => {
  try {

    if (!req.representant) {
      throw new Error("Acceso Denegado")
    }

    req.representante.tokens = req.representante.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.representante.save()

    res.send()
  } catch (error) {
    console.log(error.message)
    res.status(500).send({ error: error.message });
  }
})

// Borrar Representante: Director y Administrador
router.delete('/representante/:id_representante/eliminarRepresentante', auth, async (req, res) => {
  try {

    if (!req.director || !req.administrador) {
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
router.patch('/representante/:id_representante', auth, async (req, res) => {

  // Verificar si los campos del body son válidos
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' })
  }

  try {

    if (!req.director || !req.administrador) {
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
router.patch("/representante/:id_representante/nuevoEstudiante", auth, async (req, res) => {
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

    if (!req.director || !req.administrador) {
      throw new Error("Acceso Denegado")
    }

    // Añadir los datos del hijo al representante
    req.representante.hijos_estudiantes.push({ hijo_estudiante: datos_hijo });
    await req.representante.save();
    res.send(req.representante);
  } catch (error) {
    console.log(error.message)
    res.status(500).send({ error: error.message });
  }
});

// Ver lista de Estudiantes del representante: Representante
router.get('/representante/:id_representante', auth, async (req, res) => {
  try {

    if (!req.representant) {
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
router.get("/direccion/estudiantes", async (req, res) => {
  try {
    if (!req.director || req.administrator) {
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
router.patch('/representante/:id_representante/estudiante/:id_estudiante/moverSeccion', auth, async (req, res) => {

  try {

    if (!req.director || !req.administrador) {
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
router.patch('/representante/:id_representante/estudiante/:id_estudiante/editarEstudiante', auth, async (req, res) => {

  const estudianteId = req.params.id_estudiante;

  try {

    if (!req.director || !req.administrador) {
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
router.patch('/representante/:id_representante/estudiante/:id_estudiante/retirarSeccion', auth, async (req, res) => {

  const estudianteId = req.params.id_estudiante;

  try {

    if (!req.director || !req.administrador) {
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
router.patch('/representante/:id_representante/estudiante/:id_estudiante/registrarLiteralFinal', auth, async (req, res) => {
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
router.get('/representantes', auth, async (req, res) => {
  try {

    if (!req.director || !req.administrador) {
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

    if (!req.director || !req.administrador) {
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