const WebSocket = require('ws');
const Rendez_vous = require('../../models/Rendez_vous'); 
const {getListeRDV, getServiceMecanicien} = require('../../service/Rendez_vousServce');
const Service_rdv = require('../../models/Service_rdv');

function startRdvUpdater(clients) {
  setInterval(async () => {
    try {
      const result = await Rendez_vous.countDocuments({ etat_rdv: 0 });

      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({type: 'count_new_rdv', data: result }));
        }
      });
    } catch (error) {
      console.error('Erreur agrégation RDV :', error.message);
    }
  }, 5000);
}


function startRdvServices(clients) {
  setInterval(async () => {
    try {
      // const result = await Service_rdv.countDocuments({ "sousServicesChoisis.etat" : "valider" });
      const result = await Rendez_vous.aggregate([
        {
          $lookup: {
            from: "service_rdvs",
            localField: "_id",
            foreignField: "rendez_vous",
            as: "service_rdv"
          }
        },
        {
          $unwind: "$service_rdv"
        },
        {
          $match: {
            $and: [
              { etat_rdv: 1 },
              { estArrive: 1 },
              { etat : 0 },
              {
                $expr: {
                  $lt: ["$Avancement", 100]
                }
              }
            ]
          }
        }
      ]);      
      
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({type: 'count_service_rdv', data: result.length }));
        }
      });
    } catch (error) {
      console.error('Erreur agrégation RDV :', error.message);
    }
  }, 5000);
}

function startListRdv(clients) {
  setInterval(async () => {
    try {
      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          const result = await getListeRDV(1,10);
          client.send(JSON.stringify({ type: 'liste_rdv',...result }));
        }
      }
    } catch (error) {
      console.error('Erreur agrégation RDV 2:', error.message);
    }
  }, 5000);
}

function startListServiceRdv(clients) {
  setInterval(async () => {
    try {
      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          const result = await getServiceMecanicien();
          client.send(JSON.stringify({ type: 'liste_service_rdv', data : result }));
        }
      }
    } catch (error) {
      console.error('Erreur agrégation RDV 2:', error.message);
    }
  }, 5000);
}

module.exports = {startRdvUpdater, startListRdv, startRdvServices, startListServiceRdv};
