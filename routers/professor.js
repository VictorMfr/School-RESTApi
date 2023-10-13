// Importando Librerias
const express = require('express');
const { handleError, serverRoutes, checkAuths } = require('../utils/utils');
const mongoose = require("mongoose")

// Importando modelos
const Profesor = require('../models/professor');
const Representante = require("../models/representant");

// Importando Middlewares
const auth = require("../middleware/auth");

// Creando el router
const router = new express.Router();

// Registrar docente: Solo Director y Administrador
router.post(serverRoutes.professor.newProfessor, auth, async (req, res) => {
    try {
        // Verificando si se trata de un Director o Administrador
        checkAuths.checkIfAuthDirectorOrAdministrator(req)

        // Creando Docente
        const profesor = new Profesor(req.body);

        await profesor.save();
        res.status(201).send(profesor);
    } catch (error) {
        handleError(error, res)
    }
});

// Borrar docente: Solo Director y Administrador
router.delete(serverRoutes.professor.deleteProfessor, auth, async (req, res) => {
    try {
        // Verificando si se trata de un Director o Administrador
        checkAuths.checkIfAuthDirectorOrAdministrator(req)

        // Borrando Docente
        const profesor = await Profesor.findOneAndDelete({ _id: req.params.id_docente });

        if (!profesor) {
            return res.status(404).send();
        }

        res.send(profesor);
    } catch (error) {
        handleError(error, res)
    }
});

// Inicio de sesión de Docente
router.post(serverRoutes.professor.login, async (req, res) => {
    try {
        const profesor = await Profesor.findByCredentials(req.body.email, req.body.password);
        const token = await profesor.generateAuthToken();
        res.send({ profesor, token });
    } catch (error) {
        handleError(error, res)
    }
});

// Cerrar sesión Docente: Solo Docente
router.post(serverRoutes.professor.logout, auth, async (req, res) => {
    try {

        // Verificando si se trata del Docente
        checkAuths.checkIfAuthProfessor(req);

        req.professor.tokens = req.professor.tokens.filter((token) => token.token !== req.token);
        await req.professor.save();

        res.send();
    } catch (error) {
        handleError(error, res)
    }
});

// Habilitar Docente: Solo Director y Administrador
router.patch(serverRoutes.professor.enableProfessor, auth, async (req, res) => {
    try {
        // Verificando si se trata de un Director o Administrador
        checkAuths.checkIfAuthDirectorOrAdministrator(req)

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

// Deshabilitar Docente: Solo Director y Administrador
router.patch(serverRoutes.professor.disableProfessor, auth, async (req, res) => {
    try {
        // Verificando si se trata de un Director o Administrador
        checkAuths.checkIfAuthDirectorOrAdministrator(req)

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

// Ver lista de Docentes: Solo Director y Administrador
router.get(serverRoutes.professor.seeProfessors, auth, async (req, res) => {
    try {
        // Verificando si se trata de un Director o Administrador
        checkAuths.checkIfAuthDirectorOrAdministrator(req)

        let profesores = await Profesor.find();

        
        // Haciendo un filtro en la entrega, tomar el profesor y buscarlo en el periodo

        // Se toma el periodo
        const periodo = req.periodo;

        // Se toma el lapso correspondiente
        const lapso = req.lapso;

        // Se debe tomar el grado y seccion correspondiente
        res.send(profesores);
    } catch (error) {
        handleError(error, res)
    }
});

// Ver Docente: Solo Director y Administrador
router.get(serverRoutes.professor.seeProfessor, auth, async (req, res) => {
    try {
        // Verificando si se trata de un Director o Administrador
        checkAuths.checkIfAuthDirectorOrAdministrator(req)

        const profesor = await Profesor.findById(req.params.id_docente);

        





        res.send(profesor);
    } catch (error) {
        handleError(error, res)
    }
});

// Retirar clase Docente: Solo Director y Administrador
router.patch(serverRoutes.professor.unassignClassProfessor, auth, async (req, res) => {
    try {
        // Verificando si se trata de un Director o Administrador
        checkAuths.checkIfAuthDirectorOrAdministrator(req)

        // Obteniendo Lapso Actual
        const lapso = req.lapso;

        // Saber a qué clase se refiere para eliminar
        const clasePorEliminar = req.params.id_clase;

        // Buscar el profesor, actualizar la lista
        const profesor = await Profesor.findById(req.params.id_docente);

        // Verificar si el profesor existe
        if (!profesor) {
            throw new Error("El profesor no está registrado");
        }

        // Haciendose de identificadores claves para encontrar la clase del profesor en el periodo
        const claseAEliminarPeriodo = profesor.clases_asignadas.find(cls => cls._id.toString() == clasePorEliminar);

        const gradoABuscar = claseAEliminarPeriodo.grado;
        const seccionABuscar = claseAEliminarPeriodo.seccion;

        // Actualizar la lista
        profesor.clases_asignadas = profesor.clases_asignadas.filter(clase => clase._id.toString() != clasePorEliminar);


        // Hacer consistencia en el Periodo

        // Buscar el grado correspondiente en el periodo
        const gradoEnPeriodo = lapso.grados.find(grad => grad.grado == gradoABuscar);

        // Buscar la seccion correspondiente en el grado
        const seccionEnPeriodo = gradoEnPeriodo.secciones.find(sec => sec.seccion.toLowerCase() == seccionABuscar);

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

// Asignar Clase Docente: Solo Director y Administrador
router.patch(serverRoutes.professor.assignClassProfessor, auth, async (req, res) => {
    try {
        // Verificando si se trata de un Director o Administrador
        checkAuths.checkIfAuthDirectorOrAdministrator(req)

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
        clase_id = new mongoose.mongo.ObjectId();
        profesor.clases_asignadas = [...profesor.clases_asignadas, { grado: req.body.grado, seccion: req.body.seccion, _id: clase_id }];
        await profesor.save();

        

        // Asignar docente en seccion en periodo y guardar
        seccion.docente = profesor.email;
        seccion._id = clase_id;
        await periodo.save();

        // Actualizar el campo "docente" en los documentos de los representantes
        const representantes = await Representante.find();
        for (const representante of representantes) {
            for (const estudiante of representante.hijos_estudiantes) {
                if (
                    estudiante.hijo_estudiante.grado == req.body.grado &&
                    estudiante.hijo_estudiante.seccion == req.body.seccion
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

// Ver estudiantes del profesor: Solo Docente
router.get(serverRoutes.professor.seeProfessorStudents, auth, async (req, res) => {
    try {
        // Verificar si se trata del profesor
        checkAuths.checkIfAuthProfessor(req)

        // SE NECESITA TOMAR UNA LISTA PARA EDICIÓN EN EL PERIODO
        
        // Debemos tomar los datos del el profesor
        // Ej. [grado 1, sección A]

        // Obtener la lista de clases impartidas por el profesor
        const clasesDelProfesor = req.professor.clases_asignadas;

        // Tomar estos datos para buscar en el periodo, todos los estudiantes que tienen la misma sección y grado del profesor
        // Tomar el periodo y lapso actual

        const periodoActual = req.periodo;
        const lapsoActual = req.lapso;

        // Hay que tomar el lapso y buscar los estudiantes 
        let lista_estudiantes = [];
        clasesDelProfesor.forEach(clase => {
            // Tengo grado y seccion
            const grado = clase.grado;
            const seccion = clase.seccion;

            // Tengo que buscar en el periodo los estudiantes correspondientes en el lapso actual
            // grado y sección

            const gradoCorrespondiente= lapsoActual.grados.find(grad => grad.grado == grado);
            console.log("grado Correspondiente: " + gradoCorrespondiente)

            // Tengo que buscar la sección que coincida con la del profesor
            const seccionCorrespondiente = gradoCorrespondiente.secciones.find(sec => sec.seccion == seccion)
            console.log("seccion Correspondiente: " + seccionCorrespondiente)

            // Buscar la lista de estudiantes
            let estudiantes = seccionCorrespondiente.estudiantes


            // editar la lista de estudiantes de manera que tenga grado y seccion
            estudiantes = estudiantes.map(est => {
                return {
                    nombres: est.nombre,
                    apellidos: est.apellido,
                    cedula_escolar: est.cedula_escolar,
                    grado: gradoCorrespondiente.grado,
                    seccion: seccionCorrespondiente.seccion.toUpperCase(),
                    _id: est._id
                }
            });

            // Añadirlo en la lista de estduiantes
            lista_estudiantes = [...lista_estudiantes, ...estudiantes]
        })
        console.log(lista_estudiantes)

        res.send(lista_estudiantes);
    } catch (error) {
        handleError(error, res)
    }
});

// Cargar informe descriptivo: Solo Docente
router.post(serverRoutes.professor.uploadStudentReport, auth, async (req, res) => {
    const { descripcion } = req.body;
    

    try {
    

        // Acceder al lapso actual del periodo actual
        const lapso = req.lapso;
        const id_estudiante = req.params.id_estudiante;
        console.log(req.params.id_estudiante)


        // Se busca el estudiante en el periodo dado id_estudiante como identificador
        const estudianteEnPeriodoGrado = lapso.grados.find(grado => {
            return grado.secciones.find(seccion => {
                return seccion.estudiantes.find(est => est._id == id_estudiante)
            })
        })

        const estudianteEnPeriodoSeccion = estudianteEnPeriodoGrado.secciones.find(seccion => {
            return seccion.estudiantes.find(est => est._id == id_estudiante)
        })

        const estudianteEnPeriodo = estudianteEnPeriodoSeccion.estudiantes.find(est => est._id == id_estudiante);

        // Se aplican los cambios al Estudiante
        estudianteEnPeriodo.informe_descriptivo = descripcion;

        // Guardar cambios
        await req.periodo.save()

        res.send({ message: "Informe descriptivo cargado exitosamente" });
    } catch (error) {
        handleError(error, res)
    }
});

// Establecer rasgos personales: Solo Docente
router.post(serverRoutes.professor.uploadStudentPersonalTraits, auth, async (req, res) => {
    // Tomar los datos de Rasgos Personales
    const { rasgos } = req.body;

    try {

        // Acceder al lapso actual del periodo actual
        const lapso = req.lapso;
        const id_estudiante = req.params.id_estudiante;


        // Se busca el estudiante en el periodo dado id_estudiante como identificador
        const estudianteEnPeriodoGrado = lapso.grados.find(grado => {
            return grado.secciones.find(seccion => {
                return seccion.estudiantes.find(est => est._id == id_estudiante)
            })
        })

        const estudianteEnPeriodoSeccion = estudianteEnPeriodoGrado.secciones.find(seccion => {
            return seccion.estudiantes.find(est => est._id == id_estudiante)
        })

        const estudianteEnPeriodo = estudianteEnPeriodoSeccion.estudiantes.find(est => est._id == id_estudiante);

        // Se aplican los cambios al Estudiante
        estudianteEnPeriodo.rasgos = rasgos;

        // Guardar cambios
        await req.periodo.save()


        res.status(200).send({ message: "Rasgos personales establecidos exitosamente" });
    } catch (error) {
        handleError(error, res)
    }
});

// Registrar Calificativo Final: Solo Docente
router.post(serverRoutes.professor.registerFinalCalification, auth, async (req, res) => {
    console.log(req.body)
    const { literal_calificativo_final } = req.body;

    try {
        // Verificar si el usuario es un docente autenticado
        checkAuths.checkIfAuthProfessor(req);

        // Verificar validez del Dato
        const availableCalifications = ["A", "B", "C", "D", "E"]
        if (!availableCalifications.includes(literal_calificativo_final.toUpperCase())) {
            throw new Error("Calificativo Final no válido");
        }

        // Acceder al lapso actual del periodo actual
        const lapso = req.lapso;
        const id_estudiante = req.params.id_estudiante;

        // Se busca el estudiante en el periodo dado id_estudiante como identificador
        const estudianteEnPeriodoGrado = lapso.grados.find(grado => {
            return grado.secciones.find(seccion => {
                return seccion.estudiantes.find(est => est._id == id_estudiante)
            })
        })

        const estudianteEnPeriodoSeccion = estudianteEnPeriodoGrado.secciones.find(seccion => {
            return seccion.estudiantes.find(est => est._id == id_estudiante)
        })

        const estudianteEnPeriodo = estudianteEnPeriodoSeccion.estudiantes.find(est => est._id == id_estudiante);

        // Se aplican los cambios al Estudiante
        estudianteEnPeriodo.literal_calificativo_final = literal_calificativo_final;

        const cedulaEnPeriodo = estudianteEnPeriodo.cedula_escolar;

        // Se debe ahora registrarlo en la base de datos estatica
        const representantes = await Representante.find();

        const representanteBuscado = representantes.findIndex(rep => {
            return rep.hijos_estudiantes.find(h_est => h_est.hijo_estudiante.cedula_escolar == cedulaEnPeriodo)
        })

        const estudianteBuscado = representantes[representanteBuscado].hijos_estudiantes.findIndex(h_est => h_est.hijo_estudiante.cedula_escolar == cedulaEnPeriodo)

        // Hacer la edición
        representantes[representanteBuscado].hijos_estudiantes[estudianteBuscado].hijo_estudiante.literal_calificativo_final = literal_calificativo_final;

        // Guardar cambios
        await req.periodo.save()
        await representantes[representanteBuscado].save()


        res.status(200).send({ message: "Literal calificativo final registrado Exitosamente" });
    } catch (error) {
        handleError(error, res)
    }
});

module.exports = router
