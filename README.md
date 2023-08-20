# Rutas

## DIRECTOR

Registrar director: post /direccion/nuevoDirector

Iniciar sesion director: /direccion/iniciarSesion

Cerrar sesion director: /direccion/cerrarSesion

Eliminar director: delete /direccion/eliminarDirector

Registrar administrador: post /direccion/administracion/registrarAdministrador

Eliminar administrador delete /direccion/administracion/:administrador/eliminarAdministrador

Habilitar administrador: get /direccion/:administrador/habilitarAdministrador

Inhabilitar administrador: get /direccion/:administrador/inhabilitarAdministrador

Iniciar sesion administrador: /administracion/iniciarSesion

Cerrar sesion administrador: /administrador/cerrarSesion

## GESTIONAR DOCENTES: Solo para director y administrador

Iniciar sesion docente: /docente/iniciarSesion

Cerrar sesion docente: /docente/cerrarSesion

Registrar docente: post /docente/registrarDocente

Retirar seccion docente: post /docente/:docente/retirarSeccion

Asignar sección docente: post /docente/:docente/asignarSección

Habilitar docente: get /docente/:docente/habilitarDocente

Inhabilitar docente: get /docente/:docente/inhabilitarDocente

Eliminar docente: delete /docente/:docente/eliminardocente

Registrar representante: post /representante/nuevoRepresentante

Eliminar representante delete /representante/:representante

Editar Información representante: patch /representante/:representante

## GESTIONAR ESTUDIANTES: Solo director y administrador

(Estudiante es un atributo de Representante)

AÑadir estudiante: post /representante/:representante/estudiante/nuevoEstudiante

Mover seccion estudiante: get /representante/:representante/estudiante/:estudiante/moverSección?sección

Editar estudiante: patch representante/:representante/estudiante/:estudiante/editarEstudiante

Retirar seccion estudiante: delete /representante/:representante/estudiante/:estudiante/retirarSección

Registro estudiantil: patch /representante/:representante/estudiante/:estudiante/registroEstudiantil

## EVALUAR DESEMPEÑO ESTUDIANTIL: Solo docente

Cargar informe descriptivo: patch /estudiante/:estudiante/cargarInforme 

Establecer rasgos personales: patch /estudiante/:estudiante/cargarRasgosPersonales

Registrar calificativo final: patch /estudiante/:estudiante/registrarCalificativoFinal

(Registrar nombre del proyecto escolar: patch /estudiante/:estudiante/registrarCalificativoFinal)

## VISUALIZAR DESEMPEÑO DE ESTUDIANTES: Todos

Constancia de estudios: get /estudiante/:estudiante/constanciaDeEstudios

Boletin: get /estudiante/:estudiante/boletin

Informe descriptivo: get /estudiante/:estudiante/informeDescriptivo