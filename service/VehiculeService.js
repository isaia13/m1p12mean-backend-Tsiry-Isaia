const Vehicule=require("../models/Vehicule")
const Rendez_vous=require("../models/Rendez_vous")
const Service_rdv=require("../models/Service_rdv")

const getListeRendez_vousVehicule = async (vehicule, startDate, endDate,page,pageSize) => {
    try {
        const filter = { vehicule: vehicule };

        if (startDate && endDate) {
            filter.date_rdv = { 
                $gte: new Date(startDate),  // date de début
                $lte: new Date(endDate),    // date de fin
            };
        } else if (startDate) {
            filter.date_rdv = { $gte: new Date(startDate) };  // Filtrer uniquement par date de début
        } else if (endDate) {
            filter.date_rdv = { $lte: new Date(endDate) };  // Filtrer uniquement par date de fin
        }
        const skip = (page - 1) * pageSize;

        // Requête pour récupérer les rendez-vous avec pagination
        const rendezVous = await Rendez_vous.find(filter)
            .skip(skip)        // Ignorer les premiers résultats pour la page actuelle
            .limit(pageSize)   // Limiter le nombre de résultats par page
            .exec();

        // Compter le nombre total de rendez-vous pour ce véhicule avec les mêmes filtres
        const total = await Rendez_vous.countDocuments(filter).exec();

        // Calculer le nombre total de pages
        const totalPages = Math.ceil(total / pageSize);

        return { 
            data: rendezVous,
            totalPages: totalPages,
            currentPage: page,
            totalCount: total,
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

const getServiceAndSousServiceByRendezVous=async(rendez_vous)=>{
    try {
        return await Service_rdv.find({ rendez_vous: rendez_vous })
            .populate({ path: 'service', select: 'nom description' })
            .populate({ path: 'sousServicesChoisis.sousService', select: 'nom description prix' })
            .exec();
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message);
    }
}

module.exports={getListeRendez_vousVehicule,getServiceAndSousServiceByRendezVous}; 