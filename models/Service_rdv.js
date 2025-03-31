const mongoose = require('mongoose');
const Service_rdvSchema = new mongoose.Schema({
    service:{ type: mongoose.Schema.Types.ObjectId, ref: "Service", default: [] },
    rendez_vous:{ type: mongoose.Schema.Types.ObjectId, ref: "rendez_vous", required:true},
    sousServicesChoisis: [
        {
          sousService: { type: mongoose.Schema.Types.ObjectId, ref: "Sous_Service" }, // Sous-service sélectionné
          etat: {
            type: String,
            enum: ["en attente", "valider", "refuser"],
            default: "en attente",
          },
        //   mecanicien: { type: mongoose.Schema.Types.ObjectId, ref: "mecanicien" }
           Avancement:{type:Number,default:0.0}
        },
      ],
}, { timestamps: true });
module.exports = mongoose.model('Service_rdv', Service_rdvSchema);
