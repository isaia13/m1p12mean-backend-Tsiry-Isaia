const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../configuration/VerificationToken')
const Rendez_vous = require('../models/Rendez_vous');
const Service_rdv = require('../models/Service_rdv');
const { getListeRendez_vous } = require('../service/Rendez_vousServce')
const { getServiceAndSousServiceByRendezVous } = require('../service/VehiculeService');
const mongoose = require('mongoose');


// pour le manager
router.get('/manager', authenticateToken, async (req, res) => {
    try {
        const { start_date, end_date, marque, user_name, numeroImmat, page, pageSize } = req.query;
        const user = req.user;
        const filters = { start_date, end_date, marque, user_name, numeroImmat };
        const result = await getListeRendez_vous(filters, user, parseInt(page) || 1, parseInt(pageSize) || 10);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// liste des rendez-vous avec le recherche avancer
router.get('/', authenticateToken, authorizeRoles(['client']), async (req, res) => {
    try {
        const { start_date, end_date, marque, user_name, numeroImmat, page, pageSize } = req.query;
        const user = req.user;
        console.log(req.user);
        const filters = { start_date, end_date, marque, user_name, numeroImmat };
        const result = await Service_rdv.find()
            .populate({
                path: 'rendez_vous',
                populate: {
                    path: 'Vehicule',
                    populate: {
                        path: 'user',
                        select: 'name prenom'
                    },
                    select: 'marque numeroImmat caracteristique etat'
                },
                select: 'date_rdv date_envoie etat etat_rdv'
            })
            .populate({
                path: 'service',
                select: 'nom prix_annulation promotion mecanicien'
            })
            .populate({
                path: 'sousServicesChoisis.sousService',
                select: 'nom prix commission'
            })
            .select('sousServicesChoisis createdAt updatedAt')
            .exec();

        res.status(200).json(result);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.post('/add', authenticateToken, authorizeRoles(['client']), async (req, res) => {

    const { date_rdv, Vehicule, services } = req.body;  // Récupérer les données de la requête
    const date = new Date(date_rdv);
    const offset = date.getTimezoneOffset(); // Obtenir le décalage en minutes
    date.setMinutes(date.getMinutes() - offset); // Ajuster pour UTC
    try {

        const newRdv = new Rendez_vous({
            date_rdv: date.toISOString(),
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
router.put('/avancement/:serviceRdvId/:sousServiceId', authenticateToken, authorizeRoles(['mecanicien']), async (req, res) => {
    const { serviceRdvId, sousServiceId } = req.params;
    const { Avancement } = req.body;
    try {
        const serviceRdv = await Service_rdv.findById(serviceRdvId);

        if (!serviceRdv) {
            throw new Error('Service_rdv non trouvé');
        }
        const sousService = serviceRdv.sousServicesChoisis.find(s => s.sousService.toString() === sousServiceId);
        if (!sousService) {
            throw new Error('Sous-service non trouvé');
        }
        if (Avancement !== undefined) sousService.Avancement = Avancement;
        await serviceRdv.save();
        res.status(200).json(serviceRdv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.put('/etat/:serviceRdvId/:sousServiceId', authenticateToken, authorizeRoles(['client']), async (req, res) => {
    const { serviceRdvId, sousServiceId } = req.params;
    const { etat } = req.body;
    try {
        const serviceRdv = await Service_rdv.findById(serviceRdvId);

        if (!serviceRdv) {
            throw new Error('Service_rdv non trouvé');
        }
        const sousService = serviceRdv.sousServicesChoisis.find(s => s.sousService.toString() === sousServiceId);
        if (!sousService) {
            throw new Error('Sous-service non trouvé');
        }
        if (etat) sousService.etat = etat;
        // if (Avancement !== undefined) sousService.Avancement = Avancement;
        await serviceRdv.save();
        res.status(200).json(serviceRdv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/detail/:id', authenticateToken, async (req, res) => {
    try {
        const detail = await getServiceAndSousServiceByRendezVous(req.params.id);
        if (!detail) {
            return res.status(404).json({ message: 'Ce rendez-vous n a pas de service ' });
        }
        res.status(200).json(detail);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/delete-sous-service/:id', authenticateToken, authorizeRoles(['client']), async (req, res) => {
    try {
        const sup = await Service_rdv.updateOne(
            { 'sousServicesChoisis._id': new mongoose.Types.ObjectId(req.params.id) },
            { $pull: { sousServicesChoisis: { _id: new mongoose.Types.ObjectId(req.params.id) } } });
        res.status(201).json({ message: 'Sous-service anullé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/delete-rdv/:id', authenticateToken, authorizeRoles(['client']), async (req, res) => {
    try {
        const sup = await Rendez_vous.updateOne(
            { _id: new mongoose.Types.ObjectId(req.params.id) },
            { $set: { etat: 2 } });
        res.status(201).json({ message: 'Rendez-vous supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/valider-sous-service/:id', async (req, res) => {
    try {
        const sup = await Service_rdv.updateOne(
            { _id: new mongoose.Types.ObjectId(req.params.id) },
            { $set: { "sousServicesChoisis.$[].etat": "valider" } }
        );
        res.status(200).json({ message: 'Tous les sous-services ont été validés avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/reporter-rdv/:id', async (req, res) => {
    try {
        const sup = await Rendez_vous.updateOne(
            { _id: new mongoose.Types.ObjectId(req.params.id) },
            { $set: { etat: 1 } }
        );
        res.status(200).json({ message: 'Votre Rendez-vous a été reportés avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;