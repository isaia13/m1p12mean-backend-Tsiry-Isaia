const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Vehicule=require('../models/Vehicule');
const User=require('../models/User')
const {authenticateToken,authorizeRoles}=require('../configuration/VerificationToken');
const{getListeRendez_vousVehicule}=require('../service/VehiculeService')

// Ajout  d'un  vehicules
router.post('/',authenticateToken,authorizeRoles(['client']), async (req, res) => {
    try {
        const vehicule = new Vehicule(req.body);
        vehicule.user=req.user.userId;
        console.log(vehicule);
        
        await vehicule.save();
        res.status(201).json(vehicule);
    } catch (error) {
        
        res.status(400).json({ message: error.message ,vehicule:req.body,user:req.user});
    }
});

// modifier un voiture 
router.put('/:id',authenticateToken,authorizeRoles(['client']),async (req, res) => {
    try {
        const vehicule = await Vehicule.findOne({
            _id: new mongoose.Types.ObjectId(req.params.id),
            user: new mongoose.Types.ObjectId(req.user.userId)
        });
        if (!vehicule) {
            return { success: false, message: "Véhicule non trouvé ou vous n'êtes pas autorisé à le modifier." };
        }
        const vehiculeupdate = await Vehicule.findByIdAndUpdate(req.params.id,
            req.body, { new: true });
        res.status(201).json(vehiculeupdate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// voir les vehicules d'un client 
router.get('/',authenticateToken,authorizeRoles(['client']), async (req, res) => {
    try {
        console.log(req.user);
        if (!mongoose.Types.ObjectId.isValid(req.user.userId)) {
            console.log("Invalid User ID");
            // ( error:  );
        }else{
            console.log("Valid User ID");
        }    
        const vehicules = await Vehicule.find(
            { user: new mongoose.Types.ObjectId(req.user.userId) }
        );
        if (vehicules.length === 0) {
            return res.status(404).json({ message: 'Véhicule non trouvé' });
        }
        res.status(200).json(vehicules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// detail d'un voiture 
router.get('/:id',authenticateToken,authorizeRoles(['client']), async (req, res) => {
    try {
        const vehicule = await Vehicule.find({ user: req.user.userId ,_id:req.params.id});
        if (!vehicule) {
            return res.status(404).json({ message: 'Véhicule non trouvé' });
        }
        res.status(200).json(vehicule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// voir les rendez-vous ou historique vehicule
router.get('/rendez-vous:id',authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate,page } = req.query;
        const rendez_vous = await getListeRendez_vousVehicule(req.params.id,startDate,endDate,page,10);
        if (!rendez_vous) {
            return res.status(404).json({ message: 'Pas de rendez-vous' });
        }
        res.status(200).json(rendez_vous);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// supprimer un vehicule
router.delete('/:id',authenticateToken,authorizeRoles(['client']),async (req, res) => {
    try {
        const user = new User(req.user);
        const vehicule = await Vehicule.findOne({
            _id: new mongoose.Types.ObjectId(req.params.id),
            user: new mongoose.Types.ObjectId(req.user.userId)
        });
        if (!vehicule) {
            return { success: false, message: "Véhicule non trouvé ou vous n'êtes pas autorisé à le modifier." };
        }
        const vehiculeupdate = await Vehicule.findByIdAndUpdate(
            req.params.id, // ID du document
            { etat: 1 },   // Champs à modifier
            { new: true }  // Option pour retourner le document mis à jour
        );
        res.status(201).json({message:"suppression avec succes"});
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



module.exports=router;