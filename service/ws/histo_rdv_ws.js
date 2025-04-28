const WebSocket = require('ws');
const Rendez_vous = require('../../models/Rendez_vous');
const { getListeRDV, getServiceMecanicien } = require('../../service/Rendez_vousServce');
const Service_rdv = require('../../models/Service_rdv');

function startCountRdvServices(clients) {
  setInterval(() => {
    try {
      clients.forEach(async (client) => {
        // const result = await Service_rdv.countDocuments({ "sousServicesChoisis.etat": "en attente" });
        const result = await Service_rdv.aggregate([
          {
            $lookup: { from: "rendez_vous", localField: "rendez_vous", foreignField: "_id", as: "rendez_vous" }
          },
          {
            $unwind: "$rendez_vous"
          },
          {
            $lookup: { from: "vehicules", localField: "rendez_vous.Vehicule", foreignField: "_id", as: "vehicules" }
          },
          {
            $unwind: "$vehicules"
          },
          {
            $match: { "sousServicesChoisis.etat": "en attente", "rendez_vous.etat": 0, "vehicules.user": client.util._id }
          },
          { $count: "total" }
        ]);
        const count = result[0]?.total || 0;
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'count_histo_rdv_nv', data: count }));
          //  console.log('data utilisateur:', client.util)
          console.log('data histo service:', count)
        }
      });
    } catch (error) {
      console.error('Erreur agrégation RDV :', error.message);
    }
  }, 5000);
}

function getChangeHistoRdv(clients) {
  setInterval(() => {
    try {
      clients.forEach(async (client) => {
        const result = await Service_rdv.find()
          .populate({
            path: 'rendez_vous',
            populate: {
              path: 'Vehicule',
              populate: {
                path: 'user',
                select: 'name prenom',
                match: { _id: client.util._id }
              },
              select: 'marque numeroImmat caracteristique etat'
            },
            select: 'date_rdv date_envoie etat etat_rdv'
          })
          .populate({
            path: 'service',
            select: 'nom prix_annulation promotion mecanicien'
          })
          .populate({
            path: 'sousServicesChoisis.sousService',
            select: 'nom prix commission'
          })
          .select('sousServicesChoisis createdAt updatedAt')
          .exec();
        const filteredResult = result.filter(service =>
          service.rendez_vous?.Vehicule?.user
        );
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'list_change_histo_rdv', data: filteredResult }));
          console.log('list histo service:', filteredResult)
        }
      });
    } catch (error) {
      console.error('Erreur agrégation RDV :', error.message);
    }
  }, 5000);
}

module.exports = { startCountRdvServices, getChangeHistoRdv };
