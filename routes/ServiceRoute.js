const express = require('express');
const router = express.Router();
const Sous_Service = require('../models/Sous_service');
const Service = require('../models/Service');
const Rendez_vous = require('../models/Rendez_vous');
///io

router.post('/sous_service', async (req, res) => {
    try {
        const ss = new Sous_Service(req.body);
        await ss.save();
        res.status(200).json({ message: "OK" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.post('/nouveau', async (req, res) => {
    try {
        const service = new Service(req.body);
        await service.save();
        res.status(200).json({ message: "OK" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.get('/liste', async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.post('/update_rdv', async (req, res) => {
    try {
        const updatedRdv = await Rendez_vous.findByIdAndUpdate(
            req.body.id,
            { etat_rdv: req.body.etat_rdv ,estArrive: req.body.estArrive },
            { new: true }
        );
        res.status(200).json({ message: "Rendez-vous marquée comme vue" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.get('/nombre_new_rdv', async (req, res) => {
    try {
        const { id } = req.query;
        const result = await Rendez_vous.aggregate([
            {
                $group: { _id : "$etat_rdv", count : { $sum : 1 } }
            },
            {
                $match: { _id : parseInt(id) }
            }
        ]);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.get('/nombre_new_service_vehicule', async (req, res) => {
    try {
        const result = await Rendez_vous.aggregate([
            {
                $group: { _id : { etat_rdv : "$etat_rdv", estArrive : "$estArrive" }, count : { $sum : 1 } }
            },
            {
                $match: { "_id.etat_rdv" : 1 }
            }
        ]);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})


router.get('/liste_rdv', async (req, res) => {
    try {
        const result = await Rendez_vous.aggregate([
            {
                $lookup: { from: "utilisateurs", localField: "client", foreignField: "_id", as: "clientInfo" }
            },
            {
                $unwind: "$clientInfo"
            },
            {
                $lookup: { from: "vehicules", localField: "Vehicule", foreignField: "_id", as: "vehiculeInfo" }
            },
            {
                $unwind: "$vehiculeInfo"
            },
            {
                $lookup: { from: "service_rdvs", localField: "_id", foreignField: "rendez_vous", as: "serviceRdvInfo" }
            },
            {
                $unwind: "$serviceRdvInfo"
            },
            {
                $lookup: { from: "services", localField: "serviceRdvInfo.service", foreignField: "_id", as: "serviceInfo" }
            },
            {
                $unwind: "$serviceInfo"
            },
            {
                $lookup: { from: "sous_services", localField: "serviceRdvInfo.sousServicesChoisis.sousService", foreignField: "_id", as: "sousServiceInfo" }
            },
            {
                $unwind: "$sousServiceInfo"
            },
            {
                $group: { _id: { id_rdv: "$_id", date_rdv: "$date_rdv", date_envoie: "$date_envoie",etat_rdv: "$etat_rdv",estArrive: "$estArrive", clientInfo: "$clientInfo", vehiculeInfo: "$vehiculeInfo", serviceInfo: "$serviceInfo", serviceRdvInfo: "$serviceRdvInfo" }, sous_services: { $push: { _id: "$sousServiceInfo._id", nom: "$sousServiceInfo.nom" } } }
            },
            {
                $project: {
                    "_id.id_rdv": 1, "_id.date_rdv": 1, "_id.date_envoie": 1,"_id.estArrive": 1,"_id.etat_rdv": 1,
                    "_id.clientInfo": 1, "_id.vehiculeInfo": 1, "_id.serviceInfo": 1, "_id.serviceRdvInfo": 1,
                    "sous_services": 1, statusGarage: { $cond: { if: { $lte: ["$date_envoie", new Date()] }, then: true, else: false } }
                }
            },
            // {
            //     $match: {
            //         date_envoie: "2025-03-19",
            //         date_rdv: "2025-03-17",
            //         estArrive: 0,
            //         etat_rdv: "1",
            //         "serviceInfo._id": "67d5851b91912fd3d8e1ee0a" },
            //         _id: "67d5851b91912fd3d8e1ee0a"
            //     }
            // }
        ])
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})


module.exports = router;
