const express = require('express');
const router = express.Router();
const Vehicule=require('../models/Vehicule');
const User=require('../models/User')
const {authenticateToken,authorizeRoles}=require('../configuration/VerificationToken');


router.post('/',authenticateToken,authorizeRoles(['client']), async (req, res) => {
    try {
        const vehicule = new Vehicule(req.body);
        const user = new User(req.user);
        vehicule.user=user.id;
        await vehicule.save();
        res.status(201).json(vehicule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.put('/:id',authenticateToken,authorizeRoles(['client']),async (req, res) => {
    try {
        const user = new User(req.user);
        const vehicule = await Vehicule.findOne({
            _id: new mongoose.Types.ObjectId(req.params.id),
            user: new mongoose.Types.ObjectId(user.id)
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
router.get('/',authenticateToken,authorizeRoles(['client']), async (req, res) => {
    try {
        const vehicules = await Vehicule.find({ user: req.user._id });
        if (!vehicules) {
            return res.status(404).json({ message: 'Véhicule non trouvé' });
        }
        res.status(200).json(vehicules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id',authenticateToken,authorizeRoles(['client']), async (req, res) => {
    try {
        const vehicule = await Vehicule.find({ user: req.user._id ,_id:req.params.id});
        if (!vehicule) {
            return res.status(404).json({ message: 'Véhicule non trouvé' });
        }
        res.status(200).json(vehicule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.delete('/:id',authenticateToken,authorizeRoles(['client']),async (req, res) => {
    try {
        const user = new User(req.user);
        const vehicule = await Vehicule.findOne({
            _id: new mongoose.Types.ObjectId(req.params.id),
            user: new mongoose.Types.ObjectId(user.id)
        });
        if (!vehicule) {
            return { success: false, message: "Véhicule non trouvé ou vous n'êtes pas autorisé à le modifier." };
        }
        const vehiculeupdate = await Vehicule.findByIdAndUpdate(
            req.params.id, // ID du document
            { etat: 1 },   // Champs à modifier
            { new: true }  // Option pour retourner le document mis à jour
        );
        res.status(201).json(vehiculeupdate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


module.exports=router;