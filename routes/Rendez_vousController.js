const express = require('express');
const router = express.Router();
const {authenticateToken,authorizeRoles}=require('../configuration/VerificationToken')
const Rendez_vous =require('../models/Rendez_vous');
const Service_rdv=require('../models/Service_rdv');

router.post('/', async (req, res) => {
    try {
        const rendez_vous= new Rendez_vous();
        
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

