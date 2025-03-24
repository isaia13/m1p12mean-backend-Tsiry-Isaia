const express = require('express');
const router = express.Router();
const Service = require('../models/Service')
const { authenticateToken, authorizeRoles } = require('../configuration/VerificationToken');
const Sous_service = require('../models/Sous_service');
const mongoose = require('mongoose');

router.post('/', async (req, res) => {
    try {
        const service = new Service(req.body);
        await service.save();
        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.put('/:id', authenticateToken, authorizeRoles(['manager']), async (req, res) => {
    try {
        const service = await Service.findOne({
            _id: new mongoose.Types.ObjectId(req.params.id)
        });
        if (!service) {
            return { success: false, message: "Service non trouvé ou vous n'êtes pas autorisé à le modifier." };
        }
        const serviceUpdate = await Service.findByIdAndUpdate(req.params.id,
            req.body, { new: true });
        res.status(201).json(serviceUpdate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', authenticateToken, authorizeRoles(['manager']), async (req, res) => {
    try {
        const service = await Service.findOne({
            _id: new mongoose.Types.ObjectId(req.params.id)
        });
        if (!service) {
            return { success: false, message: "Service non trouvé ou vous n'êtes pas autorisé à le modifier." };
        }
        const serviceSuppression = await Service.findByIdAndUpdate(
            req.params.id,
            { etat: 1 },
            { new: true }
        );
        res.status(201).json({ message: "suppression avec succes" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.put('/ajout-mecanicien:id', authenticateToken, authorizeRoles(['manager']), async (req, res) => {
    try {
        const service = await Service.findOne({
            _id: new mongoose.Types.ObjectId(req.params.id)
        });
        if (!service) {
            return { success: false, message: "Service non trouvé ou vous n'êtes pas autorisé à assigner du role." };
        }
        const result = await Service.findOneAndUpdate(
            { _id: req.params.id },
            { $push: { mecanicien: { $each: mecanicien } } },
            { new: true }
        );
        res.status(201).json({ message: "Assination  de role   avec succes" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.get('/listes', async (req, res) => {
    try {
        const service = await Service.find();
        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/liste_sous_service', async (req, res) => {
    try {
        if (req.query.service) {
            if (!mongoose.Types.ObjectId.isValid(req.query.service)) {
                return res.status(400).json({ message: "Invalid ObjectId format" });
            }
            const objectId = new mongoose.Types.ObjectId(req.query.service);
            const sous_service = await Sous_service.find({
                Service: objectId
            });
            res.status(201).json(sous_service);
        } else {
            res.status(201).json([]);
        }
    } catch (error) { 
        res.status(400).json({ message: error.message });
    }    
});



module.exports = router;