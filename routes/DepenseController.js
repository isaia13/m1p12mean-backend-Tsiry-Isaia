const express = require('express');
const router = express.Router();
const Depense = require('../models/Depense')
const { authenticateToken, authorizeRoles } = require('../configuration/VerificationToken');
const Depense_valeur = require('../models/Depense_valeur');

//Ajout de depense
router.post('/', async (req, res) => {
    try {
        const depense = new Depense(req.body);
        await depense.save();
        res.status(201).json(depense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Ajout Valeur depense
router.post('/valeur', async (req, res) => {
    try {
        const depense = new Depense_valeur(req.body);
        await depense.save();
        res.status(201).json(depense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Liste des depenses effectuer
router.get('/valeur', async (req, res) => {
    try {
        const depense = await Depense_valeur.find().
            populate(
                {
                    path: 'depense',
                    select: 'nom'
                }
            );
        res.json(depense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Liste des libelles de depense
router.get('/', async (req, res) => {
    try {
        const depense = await Depense.find();
        res.json(depense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
//modifier un Libeller de depense
router.put('/:id', async (req, res) => {
    try {
        const depense = await Depense.findByIdAndUpdate(req.params.id,
            req.body, { new: true });
        res.json(depense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
//modifier un  depense
router.put('/valeur/:id', async (req, res) => {
    try {
        const depense = await Depense_valeur.findByIdAndUpdate(req.params.id,
            req.body, { new: true });
        res.json(depense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


module.exports = router;