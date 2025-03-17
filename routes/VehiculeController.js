const express = require('express');
const router = express.Router();
const Vehicule=require('../models/Vehicule');
const User=require('../models/User')
const {authenticateToken,authorizeRoles}=require('../configuration/VerificationToken');
router.post('/ajout',authenticateToken,authorizeRoles(['client']), async (req, res) => {
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


module.exports=router;