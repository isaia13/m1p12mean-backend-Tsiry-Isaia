const WebSocket = require('ws');
const Rendez_vous = require('../../models/Rendez_vous');
const Service_rdv = require('../../models/Service_rdv');
const Vehicule = require('../../models/Vehicule');

function startSuiviServicesTerminer(clients) {
    setInterval(async () => {
        try {
            const result = await Rendez_vous.aggregate([
                {
                    $lookup: { from : "payements", localField : "_id", foreignField: "rendez_vous", as : "payement" }
                },
                {
                    $unwind : "$payement"
                },
                {
                    $match: { Avancement: 100 , "payement.etat" : "en attente"}
                },
                {
                    $count: "total"
                }
            ])
            const count = result[0]?.total || 0;
            clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'count_rdv_terminer', data: count }));
                    console.log('data service terminer:', count)
                }
            });
        } catch (error) {
            console.error('Erreur agrégation RDV :', error.message);
        }
    }, 5000);
}

function getListAvancementeVehicule(clients) {
    setInterval(async () => {
        try {
            const result = await Vehicule.aggregate([
                {
                    $match: { user: client.util._id, etat: 0 }
                },
                {
                    $lookup: { from: "rendez_vous", localField: "_id", foreignField: "Vehicule", as: "rendez_vous" }
                },
                {
                    $unwind: "$rendez_vous"
                },
                {
                    $lookup: { from: "service_rdvs", localField: "rendez_vous._id", foreignField: "rendez_vous", as: "serviceRdv" }
                },
                {
                    $unwind: "$serviceRdv"
                },
                {
                    $lookup: { from: "services", localField: "serviceRdv.service", foreignField: "_id", as: "service" }
                },
                {
                    $unwind: "$service"
                },
                {
                    $lookup: { from: "sous_services", localField: "serviceRdv.sousServicesChoisis.sousService", foreignField: "_id", as: "sous_service" }
                },
                {
                    $match: { "rendez_vous.etat": 0 }
                }
            ]);
            clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'list_suivi_avancement', data: result }));
                    console.log('data list service terminer:', result)
                }
            });
        } catch (error) {
            console.error(error.message)
        }
    }, 5000);
}

module.exports = { startSuiviServicesTerminer, getListAvancementeVehicule };
