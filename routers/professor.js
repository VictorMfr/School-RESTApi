const express = require('express');
const Profesor = require('../models/professor');
const Representante = require("../models/representant");
const InformeDescriptivo = require('../models/informeDescriptivo');
const ProyectoEscolar = require('../models/proyectoEscolar');
const auth = require("../middleware/auth");
const router = new express.Router();

/*
ESTAS SON LAS RUTAS RELACIONADAS CON EL DOCENTE:

- REGISTRAR DOCENTE
- BORRAR DOCENTE
- INICIO SESIÓN DOCENTE
- CERRAR SESIÓN DOCENTE
- HABILITAR DOCENTE
- DESHABILITAR DOCENTE
- ASIGNAR SECCIÓN DOCENTE
- RETIRAR SECCIÓN DOCENTE
- VER LISTA DE DOCENTES
- VER DOCENTE ESPECIFICO
- VER ESTUDIANTES PERTENECIENTES AL DOCENTE
- CARGAR INFORME DESCRIPTIVO
- CARGAR RASGOS PERSONALES
- REGISTRAR NOMBRE DEL PROYECTO ESCOLAR
*/




// Registrar docente: Director y Administrador
router.post('/docente/registrarDocente', auth, async (req, res) => {
    const profesor = new Profesor(req.body);
    try {

        if (!req.director && !req.administrador) {
            throw new Error("Acceso Denegado")
        }

        await profesor.save();
        res.status(201).send({ profesor });
    } catch (error) {
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Borrar docente: Director y Administrador
router.delete('/docente/:id_docente/eliminarDocente', auth, async (req, res) => {
    try {

        if (!req.director && !req.administrador) {
            throw new Error("Acceso Denegado")
        }

        const profesor = await Profesor.findOneAndDelete({ _id: req.params.id_docente });

        if (!profesor) {
            return res.status(404).send();
        }

        res.send(profesor);
    } catch (error) {
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Inicio de sesión de docente
router.post('/docente/iniciarSesion', async (req, res) => {
    try {
        const profesor = await Profesor.findByCredentials(req.body.email, req.body.password);
        const token = await profesor.generateAuthToken();
        res.send({ profesor, token });
    } catch (error) {
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Cerrar sesión docente
router.post('/docente/cerrarSesion', auth, async (req, res) => {
    try {

        if (!req.professor) {
            throw new Error("Acceso Denegado")
        }

        req.professor.tokens = req.professor.tokens.filter((token) => token.token !== req.token);
        await req.professor.save();

        res.send();
    } catch (error) {
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Habilitar Docente: Director Administrador
router.patch('/docente/:id_docente/habilitarDocente', auth, async (req, res) => {
    try {

        if (!req.director && !req.administrador) {
            throw new Error("Acceso Denegado")
        }

        const profesor = await Profesor.findOneAndUpdate(
            { _id: req.params.id_docente },
            { habilitado: true },
            { new: true } // Devolver el objeto actualizado en la respuesta
        );

        if (!profesor) {
            return res.status(404).send();
        }

        res.send(profesor);
    } catch (error) {
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Deshabilitar Docente: Director y Administrador
router.patch('/docente/:id_docente/deshabilitarDocente', auth, async (req, res) => {
    try {

        if (!req.director && !req.administrador) {
            throw new Error("Acceso Denegado")
        }

        const profesor = await Profesor.findOneAndUpdate(
            { _id: req.params.id_docente },
            { habilitado: false },
            { new: true } // Devolver el objeto actualizado en la respuesta
        );

        if (!profesor) {
            return res.status(404).send();
        }

        res.send(profesor);
    } catch (error) {
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Retirar Sección Docente: Director y Administrador
router.patch('/docente/:id_docente/retirarSeccion', async (req, res) => {
    try {

        if (!req.director && !req.administrador) {
            throw new Error("Acceso Denegado")
        }

        const profesor = await Profesor.findOneAndUpdate(
            { _id: req.params.id_docente },
            { section: null },
            { new: true } // Devolver el objeto actualizado en la respuesta
        );

        if (!profesor) {
            return res.status(404).send();
        }

        res.send(profesor);
    } catch (error) {
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Asignar Sección Docente: Director y Administrador
router.patch('/docente/:id_docente/asignarSeccion', async (req, res) => {
    try {

        if (!req.director && !req.administrador) {
            throw new Error("Acceso Denegado")
        }

        const profesor = await Profesor.findOneAndUpdate(
            { _id: req.params.id_docente },
            { section: req.body.section },
            { new: true } // Devolver el objeto actualizado en la respuesta
        );

        if (!profesor) {
            return res.status(404).send();
        }

        res.send(profesor);
    } catch (error) {
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Ver lista de Docentes: Director y Administrador
router.get('/docentes', auth, async (req, res) => {
    try {

        if (!req.director && !req.administrador) {
            throw new Error("Acceso Denegado")
        }

        const profesores = await Profesor.find();
        res.send(profesores);
    } catch (error) {
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Ver Docente: Director y Administrador
router.get('/docentes/:id_docente', auth, async (req, res) => {
    try {

        if (!req.director && !req.administrador) {
            throw new Error("Acceso Denegado")
        }

        const profesor = await Profesor.findById(req.params.id_docente);
        res.send(profesor);
    } catch (error) {
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Ver estudiantes del profesor
router.get('/profesor/estudiantes', auth, async (req, res) => {
  try {

    if (!req.professor) {
        throw new Error("Acceso Denegado")
    }

    // Buscar todos los estudiantes que pertenecen a la misma sección que el profesor
    const lista_estudiantes = await Representante.find({"hijos_estudiantes.hijo_estudiante.seccion": req.professor.section});

    let lista = [];

    lista_estudiantes.forEach(representante => {
        representante.hijos_estudiantes.forEach(estudiante => {
          lista.push(estudiante.hijo_estudiante);
        });
    });

    res.send(lista);
  } catch (error) {
    console.log(error.message)
    res.status(500).send({error: error.message});
  }
});

// Cargar informe descriptivo
router.post('/informeDescriptivo/cargarInforme', auth, async (req, res) => {
    const { lapso, descripcion } = req.body;
    const docenteId = req.docente._id;
  
    try {

        if (!req.professor) {
            throw new Error("Acceso Denegado")
        }


      // Verificar que el docente esté autenticado antes de cargar el informe
      if (!docenteId) {
        throw new Error('Docente no autenticado');
      }
  
      // Crear el informe descriptivo
      const informeDescriptivo = new InformeDescriptivo({
        docente: docenteId,
        lapso,
        descripcion
      });
  
      // Guardar el informe en la base de datos
      await informeDescriptivo.save();
  
      res.status(201).send({ informeDescriptivo });
    } catch (error) {
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Establecer rasgos personales
router.post('/rasgosPersonales/establecerRasgos', auth, async (req, res) => {
    const { lapso, rasgos } = req.body;
    const userId = req.administrador ? req.administrador._id : req.professor._id;
    const userType = req.administrador ? 'Administrador' : 'Docente';
  

    try {

        if (!req.professor) {
            throw new Error("Acceso Denegado")
        }


      // Verificar que el usuario (docente o administrador) esté autenticado antes de establecer los rasgos
      if (!userId) {
        throw new Error(`${userType} no autenticado`);
      }
  
      // Crear el registro de rasgos personales
      const rasgosPersonales = new RasgosPersonales({
        docente: userId,
        lapso,
        rasgos
      });
  
      // Guardar los rasgos personales en la base de datos
      await rasgosPersonales.save();
  
      res.status(201).send({ rasgosPersonales });
    } catch (error) {
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});

// Registrar nombre del proyecto escolar: Docente y Administrador
router.post('/proyectoEscolar/registrarProyecto', auth, async (req, res) => {
    // Verificar validez de la recepción de los datos
    const { nombre, lapso } = req.body;
  
    try {
        // Verificar que el usuario (docente o administrador) esté autenticado antes de registrar el nombre del proyecto escolar
        if (!req.professor || !req.administrador) {
            throw new Error("Acceso Denegado")
        }

        

      
      
    } catch (error) {
        console.log(error.message)
        res.status(500).send({error: error.message});
    }
});




module.exports = router;
