const express = require('express');
const router = express.Router();
const Sous_Service = require('../models/Sous_service');
const Service = require('../models/Service');
const Rendez_vous = require('../models/Rendez_vous');
const mongoose = require('mongoose');
const Service_rdv = require('../models/Service_rdv');
const {authenticateToken,authorizeRoles}=require('../configuration/VerificationToken')
///io

router.post('/sous_service',authenticateToken, async (req, res) => {
    try {
        const ss = new Sous_Service(req.body);
        await ss.save();
        res.status(200).json({ message: "OK" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.post('/nouveau',authenticateToken, async (req, res) => {
    try {
        const service = new Service(req.body);
        await service.save();
        res.status(200).json({ message: "OK" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.get('/liste',authenticateToken, async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.post('/update_rdv', authenticateToken, async (req, res) => {
    try {
        const updatedRdv = await Rendez_vous.findByIdAndUpdate(
            req.body.id,
            { etat_rdv: req.body.etat_rdv, estArrive: req.body.estArrive },
            { new: true }
        );
        res.status(200).json({ message: "Rendez-vous marquée comme vue" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})


router.get('/liste_sous_service', authenticateToken, async (req, res) => {
    try {
        if (req.query.service) {
            if (!mongoose.Types.ObjectId.isValid(req.query.service)) {
                return res.status(400).json({ message: "Invalid ObjectId format" });
            }
            const objectId = new mongoose.Types.ObjectId(req.query.service);
            const sous_service = await Sous_Service.find({
                Service: objectId
            });
            res.status(201).json(sous_service);
        } else {
            res.status(201).json([]);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/nombre_new_rdv',authenticateToken , async (req, res) => {
    try {
        const { id } = req.query;
        const result = await Rendez_vous.aggregate([
            {
                $group: { _id: "$etat_rdv", count: { $sum: 1 } }
            },
            {
                $match: { _id: parseInt(id) }
            }
        ]);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.get('/nombre_new_service_vehicule',authenticateToken, async (req, res) => {
    try {
        const result = await Rendez_vous.aggregate([
            {
                $group: { _id: { etat_rdv: "$etat_rdv", estArrive: "$estArrive" }, count: { $sum: 1 } }
            },
            {
                $match: { "_id.etat_rdv": 1 }
            }
        ]);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})


router.get('/liste_rdv', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; 
        const skip = (page - 1) * limit;
        const countPipeline = [
            {
                $lookup: { from: "vehicules", localField: "Vehicule", foreignField: "_id", as: "vehiculeInfo" }
            },
            { $unwind: "$vehiculeInfo" },
            {
                $lookup: { from: "utilisateurs", localField: "vehiculeInfo.user", foreignField: "_id", as: "clientInfo" }
            },
            { $unwind: "$clientInfo" },
            {
                $lookup: { from: "service_rdvs", localField: "_id", foreignField: "rendez_vous", as: "serviceRdvInfo" }
            },
            { $unwind: "$serviceRdvInfo" },
            {
                $lookup: { from: "services", localField: "serviceRdvInfo.service", foreignField: "_id", as: "serviceInfo" }
            },
            { $unwind: "$serviceInfo" }
        ];

        const totalCount = await Rendez_vous.aggregate([
            ...countPipeline,
            { $count: "total" }
        ]);

        const total = totalCount[0]?.total || 0;

        // Pipeline principal avec pagination
        const result = await Rendez_vous.aggregate([
            ...countPipeline,
            {
                $addFields: {
                    sousServicesChoisisExist: {
                        $cond: {
                            if: { $gt: [{ $size: "$serviceRdvInfo.sousServicesChoisis" }, 0] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "sous_services",
                    localField: "serviceRdvInfo.sousServicesChoisis.sousService",
                    foreignField: "_id",
                    as: "sousServiceInfo"
                }
            },
            {
                $group: {
                    _id: {
                        id_rdv: "$_id",
                        date_rdv: "$date_rdv",
                        date_envoie: "$date_envoie",
                        etat_rdv: "$etat_rdv",
                        estArrive: "$estArrive",
                        clientInfo: "$clientInfo",
                        vehiculeInfo: "$vehiculeInfo",
                        serviceInfo: "$serviceInfo",
                        serviceRdvInfo: "$serviceRdvInfo",
                        sousServiceInfo: "$sousServiceInfo"
                    },
                    sous_services: {
                        $push: {
                            _id: "$sousServiceInfo._id",
                            nom: "$sousServiceInfo.nom"
                        }
                    }
                }
            },
            {
                $project: {
                    "_id.id_rdv": 1,
                    "_id.date_rdv": 1,
                    "_id.date_envoie": 1,
                    "_id.estArrive": 1,
                    "_id.etat_rdv": 1,
                    "_id.clientInfo": 1,
                    "_id.vehiculeInfo": 1,
                    "_id.serviceInfo": 1,
                    "_id.serviceRdvInfo": 1,
                    "_id.sousServiceInfo": 1,
                    "sous_services": 1,
                    statusGarage: {
                        $cond: {
                            if: { $lte: ["$_id.date_envoie", new Date()] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            { $skip: skip },
            { $limit: limit }
        ]);

        res.json({
            data: result,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.put('/addSousService/:id',authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const rdv = await Service_rdv.updateOne(
            { _id: id },
            { $push: { sousServicesChoisis: req.body } }
        );
        res.status(200).json({ message: "Sous-service ajoutée" });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.put('/updateSousService/:id',authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const rdv = await Service_rdv.updateMany(
            { 
                _id: id, 
                'sousServicesChoisis._id': req.body._id
            },
            {
                $set: { 
                    'sousServicesChoisis.$.Avancement': parseInt(req.body.Avancement)
                }
            }
        );

        res.status(200).json({ message: "Sous-service modifié avec succées" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/liste_par_service/:id',authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const service = await Service_rdv.findById(id)
            .populate('sousServicesChoisis.sousService');

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});

router.put('/updateAvancement/:id', async (req, res) => {
    try {
        const result = await Service_rdv.aggregate([
            {
              $match: { _id: new mongoose.Types.ObjectId(req.params.id) }
            },
            {
              $unwind: "$sousServicesChoisis"
            },
            {
              $group: {
                _id: { _id : "$_id", rendez_vous : "$rendez_vous" },
                avancement: { $avg: "$sousServicesChoisis.Avancement" }
              }
            },
            {
              $addFields: {
                avancement: "$avancement"
              }
            }
          ]);
          modifieRendezVous(result);
          res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message})
    }
})


async function modifieRendezVous(data) {
    for (const res of data) {
      try {
        const up = await Rendez_vous.updateOne({ _id: res._id.rendez_vous, Avancement : res.avancement })
        const result = await Rendez_vous.findOne({ _id: res._id.rendez_vous });
        console.log(result);
      } catch (err) {
        console.error("Erreur lors de la récupération du rendez-vous:", err);
      }
    }
  }
  


module.exports = router;
