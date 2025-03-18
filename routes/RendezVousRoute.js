const express = require('express');
const router = express.Router();
const Rendez_vous = require('../models/Rendez_vous');
const Service_rdv = require('../models/Service_rdv');

router.post('/nouveau', async (req, res) => {
    try {
        const rdv = new Rendez_vous(req.body);
        const new_rdv = await rdv.save(); 
        res.status(200).json({ message : "Votre rendez-vous à été bien enrégistré" })
    } catch (error) {
        res.status(500).json({ message : error.message })
    }
})

router.get('/liste', async (req, res) => {
    try{
        const rendez_vous = await Rendez_vous.find();
        res.json(rendez_vous);
    }catch(error) {
        res.status(500).json({ message: error.message})
    }
})

router.post('/service',async (req, res) => {
    try {
        const service = new Service_rdv(req.body);
        await service.save();
        res.status(200).json({message : "Service enregistrée"});
    }catch (error) {    
        res.status(500).json({ message: error.message })
    }
})

module.exports = router;