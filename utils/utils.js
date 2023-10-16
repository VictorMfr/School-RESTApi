const handleError = (error, res) => {
    console.log(error);
    res.status(500).send({ error: error.message })
}

const checkAuths = {
    checkIfAuthDirector(req) {
        if (!req.director) {
            throw new Error("Acceso Denegado")
        }
    },
    checkIfAuthAdministrator(req) {
        if (!req.administrador) {
            throw new Error("Acceso Denegado")
        }
    },
    checkIfAuthProfessor(req) {
        if (!req.professor) {
            console.log("heeyy")
            throw new Error("Acceso Denegado")
        }
    },
    checkIfAuthRepresentant(req) {
        if (!req.representant) {
            throw new Error("Acceso Denegado")
        }
    },
    checkIfAuthDirectorOrAdministrator(req) {
        if (!req.director && !req.administrador) {
            throw new Error("Acceso Denegado")
        }
    }
}

const serverRoutes = {
    director: {
        newDirector: '/direccion/nuevoDirector',
        login: '/direccion/iniciarSesion',
        logout: '/direccion/cerrarSesion',
        deleteSelfDirector: '/direccion/eliminarDirector',
        newPeriod: '/direccion/nuevoPeriodo',
        seeCurrentPeriod: "/direccion/periodoActual",
        seeCurrentLapse: "/direccion/lapsoActual",
        newLapse: '/direccion/periodoActual/nuevoLapso',
        addGrades: '/direccion/periodoActual/lapsos/lapsoActual/crearGrados',
        addSections: '/direccion/periodoActual/lapsos/lapsoActual/crearSecciones',
        addStudents: '/direccion/periodoActual/lapsoActual/grados/:grado/secciones/:seccion/registrarEstudiantes'
    },
    administrator: {
        newAdministrator: '/direccion/administracion/registrarAdministrador',
        login: '/administracion/iniciarSesion',
        logout: '/administracion/cerrarSesion',
        deleteAdministrator: '/direccion/administracion/:id_administrador/eliminarAdministrador',
        seeAdministrators: '/administracion',
        seeAdministrator: '/administracion/:id_administrador',
        enableAdministrador: '/direccion/:id_administrador/habilitarAdministrador',
        disableAdministrator: '/direccion/:id_administrador/deshabilitarAdministrador'
    },
    professor: {
        newProfessor: '/docente/registrarDocente',
        deleteProfessor: '/docente/:id_docente/eliminarDocente',
        login: '/docente/iniciarSesion',
        logout: '/docente/cerrarSesion',
        enableProfessor: '/docente/:id_docente/habilitarDocente',
        disableProfessor: '/docente/:id_docente/deshabilitarDocente',
        seeProfessors: '/docentes',
        seeProfessor: '/docentes/:id_docente',
        unassignClassProfessor: '/docente/:id_docente/clases/:id_clase/retirarClase',
        assignClassProfessor: '/docente/:id_docente/asignarClase',
        seeProfessorStudents: '/profesor/estudiantes',
        uploadStudentReport: '/docentes/estudiantes/:id_estudiante/informeDescriptivo/cargarInforme',
        uploadStudentPersonalTraits: '/docentes/estudiantes/:id_estudiante/rasgosPersonales/establecerRasgos',
        registerFinalCalification: "/docentes/estudiantes/:id_estudiante/calificativoFinal/registrarLiteralCalificativoFinal",
        
        seeBulletin: "/estudiante/:id_estudiante/boletin",
        seeStudentPersonalTraits: "/estudiantes/:id_estudiante/rasgosPersonales",
        SeeStudentReport: "/estudiante/:id_estudiante/informeDescriptivo",
        seeStudentProof: "/estudiante/:id_estudiante/constanciaDeEstudios",
    },
    representant: {
        newRepresentant: '/representante/nuevoRepresentante',
        login: '/representante/iniciarSesion',
        logout: '/representante/cerrarSesion',
        deleteRepresentant: '/representante/:id_representante/eliminarRepresentante',
        editRepresentant: '/representante/:id_representante',
        seeRepresentants: '/representantes',
        seeRepresentant: '/representantes/:id_representante',
        
        student: {
            addStudent: '/representante/:id_representante/nuevoEstudiante',
            seeStudents: '/representante/estudiantes',
            seeAllStudents: '/direccion/estudiantes',
            transferSectionStudent: '/representante/:id_representante/estudiante/:id_estudiante/moverSeccion',
            editStudent: '/representante/:id_representante/estudiante/:id_estudiante/editarEstudiante',
            removeSection: '/representante/:id_representante/estudiante/:id_estudiante/retirarSeccion',
        }

    }
}

module.exports = {
    handleError,
    serverRoutes,
    checkAuths
}