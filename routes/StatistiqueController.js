const {} =require('../service/StatistiqueService');
const express = require('express');
const router = express.Router();
const { getChiffreAffaireParAnnee, getChiffreAffaireParMois, getChiffreAffaireParJour } = require('../service/StatistiqueService');
const { authenticateToken,authorizeRoles } = require('../configuration/VerificationToken');

// Route pour obtenir le chiffre d'affaire par année
const getChiffreAffaireParAnneeRoute = router.get('/annee', authenticateToken,authorizeRoles('admin'), getChiffreAffaireParAnnee);
const getChiffreAffaireParMoisRoute = router.get('/mois', authenticateToken,authorizeRoles('admin'), getChiffreAffaireParMois);
const getChiffreAffaireParJourRoute = router.get('/jour', authenticateToken,authorizeRoles('admin'), getChiffreAffaireParJour);
