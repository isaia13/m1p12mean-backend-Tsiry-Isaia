const Vehicule = require('../models/Vehicule');
const express = require('express');
const router = express.Router();
const Rendez_vous = require('../models/Rendez_vous');

router.post('/nouveau',async (req, res) => {
    try {
        const vehicule = new Vehicule(req.body);
        await vehicule.save();
        res.status(200).json({ message: "Vehicule ajoutée" })
    }catch (error) {
        res.send(500).json({ message: error.message })
    }
})

router.get('/service', async (req, res) => {
    try {
        const result = await Rendez_vous.aggregate([
            {
                $lookup: { from: "service_rdvs", localField: "_id", foreignField: "rendez_vous", as: "serviceRdvInfo"  }
            },
            {
                $unwind: "$serviceRdvInfo"
            },
            {
                $lookup : { from: "vehicules", localField : "Vehicule", foreignField: "_id", as : "vehiculeInfo" }
            },
            {
                $unwind : "$vehiculeInfo"
            },
            {
                $lookup : { from: "utilisateurs", localField: "vehiculeInfo.User", foreignField: "_id", as: "clientInfo" }
            },
            {
                $unwind : "$clientInfo"
            },
            {
                $lookup : { from: "services", localField: "serviceRdvInfo.service", foreignField: "_id", as: "serviceInfo" }
            },
            {
                $unwind : "$serviceInfo"
            },
            {
                $lookup : { from: "sous_services", localField: "serviceRdvInfo.sousServicesChoisis.sousService", foreignField: "_id", as: "sousServiceInfo" }
            },
            {
                $match : {
                    $and: [
                        { etat_rdv : 1 },
                        { estArrive : 1 }
                    ]
                }
            }
        ])
        res.status(200).send(result);
    } catch (error) {
        res.send(500).json({ message: error.message });
    }
})

module.exports = router;