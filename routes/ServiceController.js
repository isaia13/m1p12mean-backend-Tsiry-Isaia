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
router.post('/global', async (req, res) => {
    try {
        const { service, sous_services } = req.body;
        const newService = await Service.create(service);
        
        const sousServicesData = sous_services.map(sous => ({
            ...sous,
            Service: newService._id
        }));
        
        const sousServicesDatas = await SousService.insertMany(sousServicesData);
        
        // Mise à jour du service avec les sous-services créés
        newService.sousServices = sousServicesDatas.map(sous => sous._id);
        await newService.save();
        
        res.status(201).json({
            service: newService,
            sous_services: sousServicesDatas
        });
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
router.put('/ajout-mecanicien/:id', authenticateToken, authorizeRoles(['manager']), async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ success: false, message: "Service non trouvé ou accès non autorisé." });
        }

        const { mecanicien } = req.body; // Récupérer les mécaniciens envoyés dans le body

        const result = await Service.findByIdAndUpdate(
            req.params.id,
            { $push: { mecanicien: { $each: mecanicien } } },
            { new: true }
        );

        res.status(200).json({ message: "Assignation du rôle avec succès", data: result });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Liste de service
router.get('/listes', async (req, res) => {
    try {
        const services = await Service.find().populate('sousServices').lean();
        res.status(200).json(services);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.put('/base/:id', async (req, res) => {
    try {
        const sous_service = await Sous_service.find({
            Service: new mongoose.Types.ObjectId(req.params.id)
        });

        const service = await Service.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });

        if (!service) {
            return res.status(404).json({ success: false, message: "Service non trouvé." });
        }

        console.log(sous_service);

        for (const sous of sous_service) {  
            service.sousServices.push(sous._id);
        }

        await service.save();

        return res.status(200).json({ message: "Service mis à jour avec succès", service });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


//liste sous-service
router.get('/liste_sous_service/:id',authenticateToken, async (req, res) => {
    try {
        // if (req.par.service) {
           const objectId = new mongoose.Types.ObjectId(req.params.id);
            const sous_service = await Sous_service.find({
                Service: objectId
            });
            if(sous_service.length==0){
                res.status(201).json({message:"service pas de sous-service"});
            }
            else{
                res.status(201).json(sous_service);
            }
            
        // }
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