const express = require('express');
const router = express.Router();
const Rendez_vous = require('../models/Rendez_vous');
const { authenticateToken, authorizeRoles } = require('../configuration/VerificationToken');
const Depense_valeur = require('../models/Depense_valeur');
const Payement = require('../models/Payement');
const mongoose = require('mongoose');

router.post('/', authenticateToken, authorizeRoles(['client']), async (req, res) => {
    try {
        console.log(req.body);
        const payement = new Payement(req.body);
        await payement.save();
        res.status(201).json(payement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/', authenticateToken, authorizeRoles(['client']), async (req, res) => {
    try {
        const payement = await Payement.find({ rendez_vous: new mongoose.Types.ObjectId(req.query.rdv)});
        res.status(201).json(payement.length);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/update-etat-payement/:id', async (req, res) => {
    try {
        const update = await Payement.updateOne(
            { _id: new mongoose.Types.ObjectId(req.params.id) },
            { $set: { etat: 'recu' } });
        res.status(201).json({ message: 'Payement marqué comme recu' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/etat', authenticateToken, authorizeRoles(['client']), async (req, res) => {
    try {
        const payement = await Payement.find()
            .populate({
                path: 'rendez_vous',
                populate: {
                    path: 'Vehicule',
                    match: { user: req.user.userId },
                    populate: {
                        path: 'user'
                    }
                }
            })
            .exec();
        const filteredPayement = payement.filter(p =>
            p.rendez_vous &&
            p.rendez_vous.Vehicule &&
            p.rendez_vous.Vehicule.user &&
            p.rendez_vous.Vehicule.user._id.equals(req.user.userId)
        );

        res.status(200).json(filteredPayement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/etat/manager', authenticateToken, authorizeRoles(['manager']), async (req, res) => {
    try {
        const payement = await Payement.find()
            .populate({
                path: 'rendez_vous',
                populate: {
                    path: 'Vehicule',
                    populate: {
                        path: 'user'
                    }
                }
            })

        res.status(200).json(payement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/set/:id',authenticateToken, authorizeRoles(['client']), async (req, res) => {
    try {
        const id = new mongoose.Types.ObjectId(req.params.id);
        const update_vue = await Payement.findOneAndUpdate(id , { vue_client : 1 }, { new : true });
        res.status(200).json({ message : "Payement marqué comme vue" });
    } catch (error) {
        res.status(400).json({ message : error.message });
    }
});

module.exports = router;