const mongoose = require('mongoose');
const Rendez_vousSchema = new mongoose.Schema({
    date_rdv: {
        type: Date
      ,required:true},
    date_envoie: {
        type: Date,
        default: () => Date.now() 
      ,required:true},
    etat: { type: Number, required: true,default:0 },// 1: reporter, 2: supprimer
    etat_rdv: { type: Number, required: true ,default:0},//0: en attente, 1: vue, 
    estArrive : { type:Number, default: 0 },// 1: arrivée
    Vehicule: { type: mongoose.Schema.Types.ObjectId,ref:"vehicule", required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });
module.exports = mongoose.model('rendez_vous', Rendez_vousSchema);
