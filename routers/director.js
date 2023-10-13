// Importando Librerias
const express = require('express')
const { handleError, serverRoutes, checkAuths } = require('../utils/utils');

// Importando modelos
const Director = require('../models/director')
const Periodo = require("../models/period")
const Representante = require("../models/representant")
const Profesor = require("../models/professor");

// Importando MiddleWares
const auth = require("../middleware/auth")

// Iniciando Router
const router = new express.Router()

// Import any necessary dependencies and models

// Define the predefined secret key (replace 'yourSecretKey' with the actual secret key)
const predefinedSecretKey = process.env.SECRET_KEY;

// Registro de director
router.post(serverRoutes.director.newDirector, async (req, res) => {
    try {
        // Verify if the sent secret key matches the predefined secret key
        const sentSecretKey = req.body.secretKey;

        if (sentSecretKey !== predefinedSecretKey) {
            return res.status(401).send({ error: 'Llave secreta no válida' });
        }

        // Verificar si el correo ya existe en la base de datos
        const directors = await Director.find();
        const isRepeatedEmail = directors.find(director => director.email === req.body.email);

        if (isRepeatedEmail) {
            throw new Error("ya esta registrado");
        }

        // Crear Director
        const director = new Director(req.body);
        await director.save();

        // Enviar Respuesta
        const token = await director.generateAuthToken();
        res.status(201).send({ director, token });
    } catch (error) {
        handleError(error, res);
    }
});


// Inicio de sesión de director
router.post(serverRoutes.director.login, async (req, res) => {
    try {
        const director = await Director.findByCredentials(req.body.email, req.body.password);
        const token = await director.generateAuthToken();
        res.send({ director, token });
    } catch (error) {
        handleError(error, res);
    }
});

// Cerrar sesión director: Solo Director
router.post(serverRoutes.director.logout, auth, async (req, res) => {
    try {
        // Verificar si se trata del Director
        checkAuths.checkIfAuthDirector(req)

        // Cerrar Sesion
        req.director.tokens = req.director.tokens.filter((token) => token.token !== req.token);
        await req.director.save();
        res.send();
    } catch (error) {
        handleError(error, res);
    }
});

// Borrar director: Solo Director
router.delete(serverRoutes.director.deleteSelfDirector, auth, async (req, res) => {
    try {
        // Verificar si se trata del Director
        checkAuths.checkIfAuthDirector(req)

        // Borrando Director
        await Director.findByIdAndDelete(req.director._id);
        res.send(req.director);
    } catch (error) {
        handleError(error, res);
    }
});





// Registrar nuevo Periodo Escolar: Solo Director
router.post(serverRoutes.director.newPeriod, auth, async (req, res) => {
    try {
        // Verificar si se trata del director
        checkAuths.checkIfAuthDirector(req)

        // Creando el Periodo
        const periodo = await new Periodo(req.body)
        await periodo.save()

        // Eliminando todos los calificativos de los estudiantes de la base de datos estatica
        const representantes = await Representante.find();

        representantes.forEach(async (representante) => {
            representante.hijos_estudiantes.forEach(h_est => {
                h_est.hijo_estudiante.literal_calificativo_final = undefined
            })
            await representante.save();
        })



        res.send(periodo)
    } catch (error) {
        handleError(error, res);
    }
});

// Registar nuevo Lapso en Periodo Actual: Solo Director
router.post(serverRoutes.director.newLapse, auth, async (req, res) => {
    try {
        // Verificar si se trata del director
        checkAuths.checkIfAuthDirector(req);

        const periodo = req.periodo;
    

        // Verificar si el lapso es igual que los anteriores
        

        // Añadir lapso
        console.log(req.lapso)
        periodo.lapsos.push({lapso: req.lapso && req.lapso.lapso? req.lapso.lapso + 1: 1, ...req.body});
        
        // Eliminando todos los calificativos de los estudiantes de la base de datos estatica
        const representantes = await Representante.find();

        representantes.forEach(async (representante) => {
            representante.hijos_estudiantes.forEach(h_est => {
                h_est.hijo_estudiante.literal_calificativo_final = undefined
            })
            await representante.save();
        })
        
        
        await periodo.save();

        res.send(periodo)
    } catch (error) {
        handleError(error, res);
    }
});

// Registar grados en Periodo Actual: Solo Director
router.post(serverRoutes.director.addGrades, auth, async (req, res) => {
    try {
        // Verificar si se trata del director
        checkAuths.checkIfAuthDirector(req)

        // Accediento al periodo y lapso correspondiente
        const periodo = req.periodo
        const lapso = req.lapso;

        // Verificando si ningun grado esta repetido en la BBDD

        // Obteniendo la lista de grados
        const grados = req.body.grados;

        // Obteniendo la lista de todos los grados en la BBDD
        const gradosBBDD = lapso.grados;

        // Verificar cada uno de los grados de req.body
        grados.forEach(grado => {
            // Comprobar si este grado en particular existe ya en la lista gradosBBDD
            const gradoExiste = gradosBBDD.find(grad => grad.grado === grado.grado)

            // Verificar si existe
            if (gradoExiste) {
                // Soltar Error
                throw new Error(`El grado ${grado.grado} ya existe en la base de datos`)
            }
        })

        // Creando los grados
        lapso.grados = lapso.grados.concat(req.body.grados)
        await periodo.save();

        res.send(periodo)
    } catch (error) {
        handleError(error, res);
    }
});

// Registar secciones en Periodo Actual: Solo Director
router.post(serverRoutes.director.addSections, auth, async (req, res) => {
    try {
        // Verificar si se trata del director
        checkAuths.checkIfAuthDirector(req)

        // Accediento al lapso y grado Correspondiente
        const periodo = req.periodo;
        const lapso = req.lapso;
        const grados = lapso.grados;

        // TAREA: LAS SECCIONES SE CARGAN PARA TODOS LOS GRADOS, DESDE DE BODY.SECCIONES
        // HAY QUE: 1) VERIFICAR SI LAS SECCIONES YA ESTAN INCLUIDAS
        // 2) AGREGAR LAS SECCIONES PARA TODOS LOS POSIBLES GRADOS

        const secciones = req.body.secciones;

        periodo.lapsos[periodo.lapsos.length -1].grados.map(grado => grado.secciones = [...secciones] )

        await periodo.save();
        res.send("hola")
    } catch (error) {
        handleError(error, res);
    }
});

// Registrar Estudiantes en Periodo Actual: Solo Director
router.post(serverRoutes.director.addStudents, auth, async (req, res) => {
    try {
        // Verificar si se trata del director
        checkAuths.checkIfAuthDirector(req)

        // Accediento al tiempo actual
        const periodo = req.periodo;
        const lapso = req.lapso;

        // Accediento al aula correspondiente
        const grado = lapso.grados[req.params.grado - 1];
        const seccion = grado.secciones.filter(seccion => seccion.seccion == req.params.seccion)[0];

        // Examinar lista de estudiantes del request
        const lista_estudiantes = req.body.estudiantes;

        // Proceso de Verificacion

        // Obtener lista entera de todos los estudiantes de la escuela
        const representantes = await Representante.find();

        let estudiantes = [];

        representantes.forEach(representante => {
            representante.hijos_estudiantes.forEach(estudiante => {
                estudiantes.push({ ...estudiante.hijo_estudiante, _id: estudiante._id, id_representante: representante._id });
            });
        });

        // Comprobar si cada uno de los estudiantes existe en la base de datos
        lista_estudiantes.every(estudiante => {
            const found = estudiantes.find(e => e.cedula_escolar === estudiante.cedula_escolar)

            if (found) {
                return true
            } else {
                throw new Error(`El estudiante con cedula ${estudiante.cedula_escolar} no existe en la base de datos`)
            }
        })

        // Rellenar los datos de la lista para ser enviados a la BBDD

        let lista_estudiantes_rellenada = [];

        lista_estudiantes.forEach(est => {
            const datos = estudiantes.find(el => el.cedula_escolar === est.cedula_escolar)
            est.nombre = datos.nombres;
            est.apellido = datos.apellidos;
            lista_estudiantes_rellenada.push(est)
        })

        // Registrar en Periodo
        seccion.estudiantes = seccion.estudiantes.concat(lista_estudiantes_rellenada)

        // Proceso de actualizar Representante

        // Obtener la lista de cédulas escolares de los estudiantes que están siendo registrados
        const cedulasEstudiantes = lista_estudiantes.map(estudiante => estudiante.cedula_escolar);

        // Actualizar el documento de Representante para cada cédula en la lista
        for (const cedula of cedulasEstudiantes) {
            // Buscar el Representante que contiene al estudiante con la cédula escolar dada
            const representante = await Representante.findOne({ 'hijos_estudiantes.hijo_estudiante.cedula_escolar': cedula });

            if (representante) {
                // Encontrar el estudiante dentro de la lista de hijos_estudiantes
                const estudianteEncontrado = representante.hijos_estudiantes.find(est => est.hijo_estudiante.cedula_escolar === cedula);

                // Actualizar los datos del estudiante (grado, sección, docente, etc.)
                estudianteEncontrado.hijo_estudiante.grado = req.params.grado;
                estudianteEncontrado.hijo_estudiante.seccion = req.params.seccion;

                // Obtener Correo del Docente
                const estudianteGrado = req.params.grado;
                const estudianteSeccion = req.params.seccion;

                // Buscar al docente en el modelo de Profesor
                const docenteAsignado = await Profesor.findOne({
                    'clases_asignadas.grado': estudianteGrado,
                    'clases_asignadas.seccion': estudianteSeccion
                });

                if (docenteAsignado) {
                    // Asignar el correo del docente al estudiante
                    estudianteEncontrado.hijo_estudiante.docente = docenteAsignado.email;
                }

                // Guardar los cambios en el documento de Representante
                await representante.save();
            }
        }

        // Guardar los cambios en el documento de Periodo
        await periodo.save();

        res.send(periodo)

    } catch (error) {
        handleError(error, res);
    }
});

// Ver periodo Actual
router.get(serverRoutes.director.seeCurrentPeriod, auth, async (req, res) => {
    res.send(req.periodo);
})

// Ver Lapso Actual
router.get(serverRoutes.director.seeCurrentLapse, auth, async (req, res) => {
    res.send(req.lapso);
})





module.exports = router;
