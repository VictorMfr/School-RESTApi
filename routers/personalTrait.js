// routes/personalTraitRoutes.js
const express = require('express');
const router = express.Router();
const PersonalTrait = require('../models/personalTrait');
const { serverRoutes, checkAuths } = require('../utils/utils');
const auth = require('../middleware/auth');

// Create
router.post(serverRoutes.personalTrait.newPersonalTrait, auth, async (req, res) => {
    const personalTrait = new PersonalTrait(req.body);
    try {

        checkAuths.checkIfAuthDirector(req);

        const savedTrait = await personalTrait.save();
        res.status(201).json(savedTrait);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Read all
router.get(serverRoutes.personalTrait.seePersonalTraits, auth, async (req, res) => {
    try {

        const traits = await PersonalTrait.find();
        res.json(traits);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Read one
router.get(serverRoutes.personalTrait.seePersonalTrait, auth, async (req, res) => {
    try {

        checkAuths.checkIfAuthDirector(req);

        const trait = await PersonalTrait.findById(req.params.id);
        if (trait == null) {
            return res.status(404).json({ message: 'Cannot find personal trait' });
        }
        res.json(trait);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update
router.patch(serverRoutes.personalTrait.editPersonalTrait, auth, async (req, res) => {
    try {

        checkAuths.checkIfAuthDirector(req);

        const trait = await PersonalTrait.findById(req.params.id);
        if (trait == null) {
            return res.status(404).json({ message: 'Cannot find personal trait' });
        }

        if (req.body.name != null) {
            trait.name = req.body.name;
        }
        if (req.body.description != null) {
            trait.description = req.body.description;
        }

        const updatedTrait = await trait.save();
        res.json(updatedTrait);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete
router.delete(serverRoutes.personalTrait.deletePersonalTrait, auth, async (req, res) => {
    try {

        checkAuths.checkIfAuthDirector(req);

        const trait = await PersonalTrait.findByIdAndDelete(req.params.id_personalTrait);
        if (trait == null) {
            return res.status(404).json({ message: 'Cannot find personal trait' });
        }

        res.json({ message: 'Deleted personal trait' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
