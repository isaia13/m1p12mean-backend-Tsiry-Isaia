const express = require('express');
const router = express.Router();
const {authenticateToken,authorizeRoles}=require('../configuration/VerificationToken')
const Rendez_vous =require('../models/Rendez_vous');
const Service_rdv=require('../models/Service_rdv');
const { model } = require('mongoose');

router.get('/', async (req, res) => {
    try {
        
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.post('/add',authenticateToken,authorizeRoles(['client']), async (req, res) => {
    const { date_rdv, Vehicule, services } = req.body;  // Récupérer les données de la requête

    try {
        const newRdv = new Rendez_vous({
            date_rdv,
            Vehicule,
            etat: 0, 
            etat_rdv: 0 
        });
        const savedRdv = await newRdv.save();
        const servicePromises = services.map(async (service) => {
            const newServiceRdv = new Service_rdv({
                service: service.service,
                rendez_vous: savedRdv._id,
                sousServicesChoisis: service.sousServicesChoisis
            });
            await newServiceRdv.save();
        });
        await Promise.all(servicePromises);
        res.status(201).json({ message: 'Rendez-vous et services créés avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création du rendez-vous et des services', error: error.message });
    }
});

router.put('/update-sousservice/:serviceRdvId/:sousServiceId', async (req, res) => {
    const { serviceRdvId, sousServiceId } = req.params;
    const { etat, Avancement } = req.body;
    try {
        const serviceRdv = await Service_rdv.findById(serviceRdvId);

        if (!serviceRdv) {
            throw new Error('Service_rdv non trouvé');
        }const sousService = serviceRdv.sousServicesChoisis.find(s => s.sousService.toString() === sousServiceId);
        if (!sousService) {
            throw new Error('Sous-service non trouvé');
        }
        if (etat) sousService.etat = etat;
        if (Avancement !== undefined) sousService.Avancement = Avancement;
        await serviceRdv.save();
        res.status(200).json(serviceRdv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports=router;