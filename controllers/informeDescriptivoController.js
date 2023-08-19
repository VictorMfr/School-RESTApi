// controllers/informeDescriptivoController.js
const InformeDescriptivo = require('../models/informeDescriptivo');

// Controlador para cargar el informe descriptivo por un docente
const cargarInformeDescriptivo = async (req, res) => {
  const { lapso, descripcion } = req.body;
  const docenteId = req.profesor._id;

  try {
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
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = { cargarInformeDescriptivo };
