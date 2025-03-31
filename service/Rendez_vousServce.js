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


module.exports={getListeRendez_vous}