const Vehicule=require("../models/Vehicule")

async function ajout_vehicule(id_client,Caractecristique,marque){
    const vehicule=new Vehicule({
        user:id_client,
        caracteristique:Caractecristique,
        marque:marque
    });
    await vehicule.save();
}

async function list_vehicule(id_client){
    const value= await Vehicule.find({ user: new ObjectId(id_client) })
    return value;
}

async function updateVehiculeByUser(id_vehicule, id_user, caracteristique, marque) {
    try {
        // Vérifier si le véhicule appartient bien à l'utilisateur
        const vehicule = await Vehicule.findOne({
            _id: new mongoose.Types.ObjectId(id_vehicule),
            user: new mongoose.Types.ObjectId(id_user)
        });

        if (!vehicule) {
            return { success: false, message: "Véhicule non trouvé ou vous n'êtes pas autorisé à le modifier." };
        }

        // Mise à jour du véhicule
        const updatedVehicule = await Vehicule.findByIdAndUpdate(
            id_vehicule,
            { caracteristique, marque },
            { new: true, runValidators: true }
        );

        return { success: true, vehicule: updatedVehicule };
    } catch (error) {
        console.error("Erreur lors de la mise à jour du véhicule :", error);
        return { success: false, message: "Une erreur est survenue." };
    }
}

async function supprime_vehicule(id_vehicule){

}

module.exports=ajout_vehicule(),list_vehicule(),updateVehiculeByUser(); 