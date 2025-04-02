const express = require('express');
const router = express.Router();
const Service = require('../models/Service')
const { authenticateToken, authorizeRoles } = require('../configuration/VerificationToken');
const Sous_service = require('../models/Sous_service');
const mongoose = require('mongoose');
const Vehicule=require('../models/Vehicule');
const User=require('../models/User');
const Rendez_vous = require('../models/Rendez_vous');

// Ajout d'un service
router.post('/', async (req, res) => {
    try {
        const service = new Service(req.body);
        await service.save();
        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// modification d'un service
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
// Suppression d'un sous service
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

// attribution d'un role avec un ou des mecanicien 
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

// Liste de service
router.get('/listes', async (req, res) => {
    try {
        const service = await Service.find();
        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
//liste sous-service
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
            res.status(201).json({message:"service pas de sous-service"});
        }
    } catch (error) { 
        res.status(400).json({ message: error.message });
    }    
});


router.get('/suivi',authenticateToken,authorizeRoles(['client']), async (req, res) => {
    try {
        console.log(req.user);  
        const result = await Vehicule.aggregate([
            {
                $match: { user: new mongoose.Types.ObjectId(req.user.userId), etat: 0 }
            },
            {
                $lookup: { from : "rendez_vous", localField: "_id", foreignField: "Vehicule", as : "rendez_vous" }
            },
            {
                $unwind: "$rendez_vous"
            },
            {
                $lookup: { from : "service_rdvs", localField: "rendez_vous._id", foreignField: "rendez_vous", as : "serviceRdv" }
            },
            {
                $unwind: "$serviceRdv"
            },
            {
                $lookup: { from : "services", localField: "serviceRdv.service", foreignField: "_id", as : "service" }
            },
            {
                $unwind: "$service"
            },
            {
                $lookup: { from : "sous_services", localField: "serviceRdv.sousServicesChoisis.sousService", foreignField: "_id", as : "sous_service" }
            },
        ])
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



module.exports = router;