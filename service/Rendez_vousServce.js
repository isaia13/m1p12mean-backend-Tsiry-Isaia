const Rendez_vous=require('../models/Rendez_vous')
// Fonction dynamique pour récupérer les rendez-vous
const getListeRendez_vous = async (filters = { start_date, end_date, marque, user_name, user, numeroImmat }, user, page = 1, pageSize = 10) => {
    try {
        const filter = {};

        // Si c'est un client, on filtre par son ID
        if (user.role === 'client') {
            filter['vehicule.user'] = user._id;
        } else {
            // Filtrer par date de rendez-vous
            if (filters.start_date && filters.end_date) {
                filter.date_rdv = {
                    $gte: new Date(filters.start_date),
                    $lte: new Date(filters.end_date),
                };
            } else if (filters.start_date) {
                filter.date_rdv = { $gte: new Date(filters.start_date) };
            } else if (filters.end_date) {
                filter.date_rdv = { $lte: new Date(filters.end_date) };
            }

            // Filtrer par le nom du propriétaire du véhicule
            if (filters.user_name) {
                filter['vehicule.user.nom'] = { $regex: filters.user_name, $options: 'i' };
            }

            // Filtrer par marque du véhicule
            if (filters.marque) {
                filter['vehicule.marque'] = { $regex: filters.marque, $options: 'i' };
            }

            // Filtrer par numéro d'immatriculation du véhicule
            if (filters.numeroImmat) {
                filter['vehicule.numeroImmat'] = { $regex: filters.numeroImmat, $options: 'i' };
            }
        }

        // Récupérer les rendez-vous avec pagination et relations peuplées
        const rendezVous = await Rendez_vous.find(filter)
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .populate({
                path: 'Vehicule', // Nom exact du champ dans Rendez_vous, ici "vehicule"
                populate: {
                  path: 'user', // Référence au champ "user" dans Vehicule
                  select: 'name prenom' // On sélectionne les champs du user
                },
                select: 'marque numeroImmat caracteristique etat' // On sélectionne les champs pertinents du véhicule
              })
              .select('date_rdv etat etat_rdv')
            .exec();
        // Compter le nombre total de résultats
        const total = await Rendez_vous.countDocuments(filter).exec();
        const totalPages = Math.ceil(total / pageSize);

        return {
            data: rendezVous,
            totalPages: totalPages,
            currentPage: page,
            totalCount: total
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

async function getListeRDV(page = 1, limit = 10) {
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
      {
        $sort : { "_id.date_rdv" : 1 }
      },
      { $skip: skip },
      { $limit: limit }
    ]);
  
    return {
      data: result,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    };
  }

  async function getServiceMecanicien() {
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
              $lookup : { from: "utilisateurs", localField: "vehiculeInfo.user", foreignField: "_id", as: "clientInfo" }
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
                      { estArrive : 1 },
                      { etat : 0 }
                  ]
              }
          }
      ])
      return result;
  } catch (error) {
      console.log(error.message);
  }
  } 


module.exports={getListeRendez_vous, getListeRDV, getServiceMecanicien};