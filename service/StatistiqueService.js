const Payement=require('../models/Payement')
const getChiffreAffaireParAnnee = async (req, res) => {
    const { startDate, endDate } = req.query; // Date de début et de fin pour filtrer les années (optionnel)

    const value = await Payement.aggregate([
        // Étape 1 : Filtrer les paiements dans la plage de dates
        {
            $match: {
                date: { 
                    $gte: new Date(startDate), // Filtrer les paiements à partir de startDate
                    $lte: new Date(endDate)    // Filtrer jusqu'à endDate
                }
            }
        },
        // Étape 2 : Extraire l'année
        {
            $project: {
                annee: { $year: { date: "$date" } }, // Extraire l'année
                prix: 1 // Garder le prix pour l'agrégation
            }
        },
        // Étape 3 : Grouper par année
        {
            $group: {
                _id: "$annee", // Regrouper par année
                total: { $sum: "$prix" } // Calculer le total par année
            }
        },
        // Étape 4 : Trier par année croissante
        {
            $sort: { "_id": 1 } // Trier par année croissante
        }
    ]);

    res.json(value); // Renvoie les résultats sous forme de réponse JSON
};


const getChiffreAffaireParMois = async (req, res) => {
    const { annee } = req.query; // Année donnée pour filtrer

    const value = await Payement.aggregate([
        // Étape 1 : Filtrer les paiements pour l'année spécifiée
        {
            $match: {
                date: { 
                    $gte: new Date(`${annee}-01-01`), // Filtrer à partir du début de l'année
                    $lte: new Date(`${annee}-12-31`)  // Filtrer jusqu'à la fin de l'année
                }
            }
        },
        // Étape 2 : Extraire le mois et l'année
        {
            $project: {
                mois: { $month: { date: "$date" } }, // Extraire le mois
                annee: { $year: { date: "$date" } }, // Extraire l'année
                prix: 1 // Garder le prix pour l'agrégation
            }
        },
        // Étape 3 : Grouper par mois et année
        {
            $group: {
                _id: { mois: "$mois", annee: "$annee" }, // Grouper par mois et année
                total: { $sum: "$prix" } // Calculer le total par mois
            }
        },
        // Étape 4 : Trier par mois croissant
        {
            $sort: { "_id.mois": 1 } // Trier par mois croissant
        }
    ]);

    res.json(value); // Renvoie les résultats sous forme de réponse JSON
};
const getChiffreAffaireParJour = async (req, res) => {
    const { annee, mois } = req.query; // Année et mois spécifiés

    const value = await Payement.aggregate([
        // Étape 1 : Filtrer les paiements pour le mois et l'année spécifiés
        {
            $match: {
                date: { 
                    $gte: new Date(`${annee}-${mois}-01`), // Filtrer à partir du 1er du mois
                    $lte: new Date(`${annee}-${mois}-31`)  // Filtrer jusqu'à la fin du mois
                }
            }
        },
        // Étape 2 : Extraire le jour, mois et année
        {
            $project: {
                jour: { $dayOfMonth: { date: "$date" } }, // Extraire le jour
                mois: { $month: { date: "$date" } },     // Extraire le mois
                annee: { $year: { date: "$date" } },     // Extraire l'année
                prix: 1 // Garder le prix pour l'agrégation
            }
        },
        // Étape 3 : Grouper par jour, mois et année
        {
            $group: {
                _id: { jour: "$jour", mois: "$mois", annee: "$annee" }, // Grouper par jour, mois et année
                total: { $sum: "$prix" } // Calculer le total par jour
            }
        },
        // Étape 4 : Trier par jour croissant
        {
            $sort: { "_id.jour": 1 } // Trier par jour croissant
        }
    ]);

    res.json(value); // Renvoie les résultats sous forme de réponse JSON
};

module.exports={getChiffreAffaireParAnnee,getChiffreAffaireParMois,getChiffreAffaireParJour};