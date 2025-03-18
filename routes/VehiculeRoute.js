const Vehicule = require('../models/Vehicule');
const express = require('express');
const router = express.Router();

router.post('/nouveau',async (req, res) => {
    try {
        const vehicule = new Vehicule(req.body);
        await vehicule.save();
        res.status(200).json({ message: "Vehicule ajoutée" })
    }catch (error) {
        res.send(500).json({ message: error.message })
    }
})

module.exports = router;