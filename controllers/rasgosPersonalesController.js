// controllers/rasgosPersonalesController.js
const RasgosPersonales = require('../models/rasgosPersonales');

// Controlador para establecer los rasgos personales por un docente o administrador
const establecerRasgosPersonales = async (req, res) => {
  const { lapso, rasgos } = req.body;
  const userId = req.administrador ? req.administrador._id : req.profesor._id;
  const userType = req.administrador ? 'Administrador' : 'Profesor';

  try {
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
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = { establecerRasgosPersonales };
