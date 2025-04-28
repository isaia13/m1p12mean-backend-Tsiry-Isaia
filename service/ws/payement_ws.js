const WebSocket = require('ws');
const Rendez_vous = require('../../models/Rendez_vous');
const Service_rdv = require('../../models/Service_rdv');
const Payement = require('../../models/Payement');

function startCountServicesPayementRecu(clients) {
  setInterval(async () => {
    try {
      // const result = await Service_rdv.countDocuments({ "sousServicesChoisis.etat": "en attente" });
      const result = await Payement.aggregate([
        {
          $match: { etat: "recu", vue_client: 0 }
        },
        { $count: "total" }
      ]);
      const count = result[0]?.total || 0;
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'count_payement_rdv_recu', data: count }));
          console.log('data payement service:', count)
        }
      });
    } catch (error) {
      console.error('Erreur agrégation RDV :', error.message);
    }
  }, 5000);
}

function getChangePayement(clients) {
  setInterval(() => {
    try {
      clients.forEach(async (client) => {
        const payement = await Payement.find()
          .populate({
            path: 'rendez_vous',
            populate: {
              path: 'Vehicule',
              match: { user: client.util._id },
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
          p.rendez_vous.Vehicule.user._id.equals(client.util._id)
        );
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'list_change_payement_rdv', data: filteredPayement }));
          console.log('list payement:', filteredPayement)
        }
      });
    } catch (error) {
      console.error('Erreur agrégation RDV :', error.message);
    }
  }, 5000);
}


module.exports = { startCountServicesPayementRecu, getChangePayement };
