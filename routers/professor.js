// Importando Librerias
const express = require('express');
const {handleError, serverRoutes} = require('../utils/utils')

// Importando modelos
const Profesor = require('../models/professor');
const Representante = require("../models/representant");

// Importando Middlewares
const auth = require("../middleware/auth");

// Creando el router
const router = new express.Router();

// Registrar docente: Director y Administrador
router.post(serverRoutes.professor.newProfessor, auth, async (req, res) => {
    const profesor = new Profesor(req.body);
    try {

        if (!req.director && !req.administrador) {
            throw new Error("Acceso Denegado")
        }

        await profesor.save();
        res.status(201).send(profesor);
    } catch (error) {
        handleError(error, res)
    }
});

// Borrar docente: Director y Administrador
router.delete(serverRoutes.professor.deleteProfessor, auth, async (req, res) => {
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
        handleError(error, res)
    }
});

// Inicio de sesión de docente
router.post(serverRoutes.professor.login, async (req, res) => {
    try {
        const profesor = await Profesor.findByCredentials(req.body.email, req.body.password);
        const token = await profesor.generateAuthToken();
        res.send({ profesor, token });
    } catch (error) {
        handleError(error, res)
    }
});

// Cerrar sesión docente
router.post(serverRoutes.professor.logout, auth, async (req, res) => {
    try {

        if (!req.professor) {
            throw new Error("Acceso Denegado")
        }

        req.professor.tokens = req.professor.tokens.filter((token) => token.token !== req.token);
        await req.professor.save();

        res.send();
    } catch (error) {
        handleError(error, res)
    }
});

// Habilitar Docente: Director Administrador
router.patch(serverRoutes.professor.enableProfessor, auth, async (req, res) => {
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
        handleError(error, res)
    }
});

// Deshabilitar Docente: Director y Administrador
router.patch(serverRoutes.professor.disableProfessor, auth, async (req, res) => {
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
        handleError(error, res)
    }
});

// Ver lista de Docentes: Director y Administrador
router.get(serverRoutes.professor.seeProfessors, auth, async (req, res) => {
    try {

        if (!req.director && !req.administrador) {
            throw new Error("Acceso Denegado")
        }

        const profesores = await Profesor.find();
        res.send(profesores);
    } catch (error) {
        handleError(error, res)
    }
});

// Ver Docente: Director y Administrador
router.get(serverRoutes.professor.seeProfessor, auth, async (req, res) => {
    try {

        if (!req.director && !req.administrador) {
            throw new Error("Acceso Denegado")
        }

        const profesor = await Profesor.findById(req.params.id_docente);
        res.send(profesor);
    } catch (error) {
        handleError(error, res)
    }
});

// Retirar clase Docente: Director y Administrador
router.patch(serverRoutes.professor.unassignClassProfessor, auth, async (req, res) => {
    try {
        const lapso = req.lapso;

        // Verificar si es Director o Administrador
        if (!req.director && !req.administrador) {
            throw new Error("Acceso Denegado");
        }

        // Saber a qué clase se refiere para eliminar
        const clasePorEliminar = req.params.id_clase;

        // Buscar el profesor, actualizar la lista
        const profesor = await Profesor.findById(req.params.id_docente);

        // Verificar si el profesor existe
        if (!profesor) {
            throw new Error("El profesor no está registrado");
        }

        // Haciendose de identificadores claves para encontrar la clase del profesor en el periodo
        const claseAEliminarPeriodo = profesor.clases_asignadas.find(cls => cls._id.toString() === clasePorEliminar);
        const gradoABuscar = claseAEliminarPeriodo.grado;
        const seccionABuscar = claseAEliminarPeriodo.seccion;

        // Actualizar la lista
        profesor.clases_asignadas = profesor.clases_asignadas.filter(clase => clase._id.toString() !== clasePorEliminar);


        // Hacer consistencia en el Periodo

        // Buscar el grado correspondiente en el periodo
        const gradoEnPeriodo = lapso.grados.find(grad => grad.grado === gradoABuscar);

        // Buscar la seccion correspondiente en el grado
        const seccionEnPeriodo = gradoEnPeriodo.secciones.find(sec => sec.seccion.toLowerCase() === seccionABuscar);

        // Quitar Profesor de la Seccion
        seccionEnPeriodo.docente = undefined; 

        // Guardar Cambios
        await req.periodo.save();
        await profesor.save();

    

        res.send(profesor);
    } catch (error) {
        handleError(error, res)
    }
});

// Asignar Clase Docente: Director y Administrador
router.patch(serverRoutes.professor.assignClassProfessor, auth, async (req, res) => {
    try {
        if (!req.director && !req.administrador) {
            throw new Error("Acceso Denegado")
        }

        // Comprobar si el profesor está en la base de datos
        const profesor = await Profesor.findById(req.params.id_docente)

        if (!profesor) {
            return res.status(404).send("Profesor no encontrado");
        }

        // Buscar el periodo y lapso actuales
        const periodo = req.periodo;
        const lapso = req.lapso

        let isSectionGradeExist = false;

        // Buscar si coincide el grado y seccion
        lapso.grados.forEach(element => {
            if (element.grado == req.body.grado) {
                // Existe el grado; Comprobar si está la seccion
                element.secciones.forEach(e => {
                    if (e.seccion == req.body.seccion) {
                        isSectionGradeExist = true;
                    }
                })
            }
        });

        if (!isSectionGradeExist) {
            throw new Error("No existe dicho grado o seccion en este Periodo")
        }

        // Coincide el grado y seccion

        // Verificar si otro profesor ya ocupó ese espacio
        const seccion = lapso.grados[req.body.grado - 1].secciones.find(element => element.seccion == req.body.seccion);

        if (seccion.docente) {
            throw new Error("Dicho espacio de clase ya está ocupado")
        }

        // El espacio está libre

        // Asignar la clase en profesor y guardar
        profesor.clases_asignadas = [...profesor.clases_asignadas, { grado: req.body.grado, seccion: req.body.seccion }];
        await profesor.save();

        // Asignar docente en seccion en periodo y guardar
        seccion.docente = profesor.email;
        await periodo.save();

        // Actualizar el campo "docente" en los documentos de los representantes
        const representantes = await Representante.find();
        for (const representante of representantes) {
            for (const estudiante of representante.hijos_estudiantes) {
                if (
                    estudiante.hijo_estudiante.grado === req.body.grado &&
                    estudiante.hijo_estudiante.seccion === req.body.seccion
                ) {
                    estudiante.hijo_estudiante.docente = profesor.email;
                }
            }
            await representante.save();
        }

        res.send(seccion);
    } catch (error) {
        handleError(error, res)
    }
});











// Ver estudiantes del profesor
router.get(serverRoutes.professor.seeProfessorStudents, auth, async (req, res) => {
    try {

        if (!req.professor) {
            throw new Error("Acceso Denegado")
        }

        // Buscar todos los estudiantes que pertenecen al mismo grado y seccion que el profesor 5A 6B 7C
        const lista_estudiantes = await Representante.find({ "hijos_estudiantes.hijo_estudiante.seccion": req.professor.section, "hijos_estudiantes.hijo_estudiante.grado": req.professor.grado });

        let lista = [];

        lista_estudiantes.forEach(representante => {
            representante.hijos_estudiantes.forEach(estudiante => {
                lista.push(estudiante.hijo_estudiante);
            });
        });

        res.send(lista);
    } catch (error) {
        handleError(error, res)
    }
});

// Cargar informe descriptivo
router.post(serverRoutes.professor.uploadStudentReport, auth, async (req, res) => {
    const { lapso, descripcion } = req.body;

    try {
        // Verificar si esta autentificado como profesor
        if (!req.professor) {
            throw new Error("Acceso Denegado");
        }

        // Buscar el período actual
        const periodo = req.periodo;
        const lapsoActual = periodo.lapsos.find(l => l.lapso === lapso);

        if (!lapsoActual) {
            throw new Error("Lapso no encontrado");
        }

        // Encontrar el estudiante por su ID
        const estudiante = lapsoActual.grados.reduce((found, grado) => {
            if (found) return found;
            const seccion = grado.secciones.find(s => s.estudiantes.some(e => e._id.toString() === req.params.id_estudiante));
            if (seccion) {
                return seccion.estudiantes.find(e => e._id.toString() === req.params.id_estudiante);
            }
            return null;
        }, null);

        if (!estudiante) {
            throw new Error("Estudiante no encontrado");
        }

        // Actualizar el informe descriptivo del estudiante
        estudiante.informe_descriptivo = descripcion;

        // Guardar los cambios en el período
        await periodo.save();

        res.send({ message: "Informe descriptivo cargado exitosamente" });
    } catch (error) {
        handleError(error, res)
    }
});

// Establecer rasgos personales
router.post(serverRoutes.professor.uploadStudentPersonalTraits, auth, async (req, res) => {
    const { lapso, rasgos } = req.body;

    try {
        // Verificar si el usuario es un docente autenticado
        if (!req.professor) {
            throw new Error("Acceso Denegado");
        }

        // Acceder al lapso y sección correspondiente del docente
        const lapsoActual = req.lapso;
        const gradoActual = req.params.grado;
        const seccionActual = req.params.seccion;

        // Encontrar la sección correspondiente en el lapso actual
        const seccion = lapsoActual.grados[gradoActual - 1].secciones.find(
            (seccion) => seccion.seccion === seccionActual
        );

        // Verificar si la sección existe
        if (!seccion) {
            throw new Error("Sección no encontrada");
        }

        // Acceder a la lista de estudiantes en la sección
        const estudiantes = seccion.estudiantes;

        // Recorrer la lista de estudiantes y establecer los rasgos personales
        estudiantes.forEach((estudiante) => {
            const cedulaEstudiante = estudiante.cedula_escolar;

            // Buscar al estudiante por cédula en la lista de rasgos
            const estudianteRasgos = rasgos.find(
                (rasgosEstudiante) => rasgosEstudiante.cedula_escolar === cedulaEstudiante
            );

            // Si se encontraron rasgos para el estudiante, actualizarlos
            if (estudianteRasgos) {
                estudiante.rasgos = estudianteRasgos.rasgos;
            }
        });

        // Guardar los cambios en la base de datos
        await lapsoActual.save();

        res.status(201).send({ message: "Rasgos personales establecidos exitosamente" });
    } catch (error) {
        handleError(error, res)
    }
});

module.exports = router
