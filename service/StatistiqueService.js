const Payement=require('../models/Payement')
const getChiffreAffaireParAnnee = async (req, res) => {
    const { startDate, endDate } = req.query; 
    const value = await Payement.aggregate([
        {
            $match: {
                date: { 
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }
        },
        {
            $project: {
                annee: { $year: { date: "$date" } },
                prix: 1
            }
        },
        {
            $group: {
                _id: "$annee",
                total: { $sum: "$prix" }
            }
        },
        {
            $sort: { "_id": 1 }
        }
    ]);

    res.json(value);
};


const getChiffreAffaireParMois = async (req, res) => {
    const { annee } = req.query;
    const value = await Payement.aggregate([
        {
            $match: {
                date: { 
                    $gte: new Date(`${annee}-01-01`),
                    $lte: new Date(`${annee}-12-31`)
                }
            }
        },
        {
            $project: {
                mois: { $month: { date: "$date" } },
                annee: { $year: { date: "$date" } },
                prix: 1
            }
        },
        {
            $group: {
                _id: { mois: "$mois", annee: "$annee" },
                total: { $sum: "$prix" }
            }
        },
        {
            $sort: { "_id.mois": 1 }
        }
    ]);
    res.json(value);
};
const getChiffreAffaireParJour = async (req, res) => {
    const { annee, mois } = req.query;
    const value = await Payement.aggregate([
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