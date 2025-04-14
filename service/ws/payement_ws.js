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
        $match: { etat : "recu" }
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


module.exports = { startCountServicesPayementRecu };
