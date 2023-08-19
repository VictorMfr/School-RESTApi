// controllers/proyectoEscolarController.js
const ProyectoEscolar = require('../models/proyectoEscolar');

// Controlador para registrar el nombre del proyecto escolar por un docente o administrador
const registrarProyectoEscolar = async (req, res) => {
  const { nombre, lapso } = req.body;
  const userId = req.administrador ? req.administrador._id : req.profesor._id;
  const userType = req.administrador ? 'Administrador' : 'Profesor';

  try {
    // Verificar que el usuario (docente o administrador) esté autenticado antes de registrar el nombre del proyecto escolar
    if (!userId) {
      throw new Error(`${userType} no autenticado`);
    }

    // Crear el registro del proyecto escolar
    const proyectoEscolar = new ProyectoEscolar({
      docente: userId,
      nombre,
      lapso
    });

    // Guardar el nombre del proyecto escolar en la base de datos
    await proyectoEscolar.save();

    res.status(201).send({ proyectoEscolar });
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = { registrarProyectoEscolar };
