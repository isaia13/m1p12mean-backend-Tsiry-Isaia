const mongoose = require('mongoose');
const Rendez_vousSchema = new mongoose.Schema({
    date_rdv: {
        type: Date
      ,required:true},
    date_envoie: {
        type: Date,
        default: () => Date.now() 
      ,required:true},
    etat: { type: Number, required: true,default:0 },
    etat_rdv: { type: Number, required: true ,default:0},
    Vehicule: { type: mongoose.Schema.Types.ObjectId,ref:"vehicule", required: true },
}, { timestamps: true });
module.exports = mongoose.model('rendez_vous', Rendez_vousSchema);
