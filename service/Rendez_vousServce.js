const Vehicule =require('../models/Vehicule')
const Rendez_vous=require('../models/Rendez_vous')
const Service_rdv =require('../models/Service_rdv')
const Sous_service=require('../models/Sous_service')
// Fonction dynamique pour récupérer les rendez-vous
const getListeRendez_vous = async (filters = {start_date,end_date,marque,user_name,numeroImmat}, page = 1, pageSize = 10) => {
    try {
        // Construire le filtre de base
        const filter = {};

        // Filtrer par dates si présentes
        if (filters.start_date && filters.end_date) {
            filter.date_rdv = { 
                $gte: new Date(filters.start_date),  // Date de début
                $lte: new Date(filters.end_date),    // Date de fin
            };
        } else if (filters.start_date) {
            filter.date_rdv = { $gte: new Date(filters.start_date) };  // Filtrer par date de début uniquement
        } else if (filters.end_date) {
            filter.date_rdv = { $lte: new Date(filters.end_date) };  // Filtrer par date de fin uniquement
        }

        // Filtrer par le nom de l'utilisateur si fourni (recherche partielle)
        if (filters.user_name) {
            filter.vehicule = { 
                $in: [{ marque: { $regex: filters.marque, $options: 'i' } }] // Si marque est donnée
            };
            filter.vehicule.user = { nom: { $regex: filters.user_name, $options: 'i' } };  // Recherche partielle du nom de l'utilisateur
        }

        // Filtrer par le véhicule si une marque est donnée
        if (filters.marque) {
            filter.vehicule = filter.vehicule || {}; // Assurer que 'vehicule' existe
            filter.vehicule.marque = { $regex: filters.marque, $options: 'i' };  // Recherche insensible à la casse pour la marque
        }

        // Filtrer par numéro d'immatriculation du véhicule si fourni
        if (filters.numeroImmat) {
            filter.vehicule = filter.vehicule || {};  // Assurer que 'vehicule' existe
            filter.vehicule.numeroImmat = { $regex: filters.numeroImmat, $options: 'i' }; // Recherche insensible à la casse pour immatriculation
        }

        // Recherche des rendez-vous avec les filtres
        const rendezVous = await Rendez_vous.find(filter)
            .skip((page - 1) * pageSize)   
            .limit(pageSize)               
            .populate({
                path: 'vehicule',  
                populate: {
                    path: 'user',  
                    select: 'nom email'
                }
            })
            .exec();
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

module.exports={getListeRendez_vous,}