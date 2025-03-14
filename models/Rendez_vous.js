const mongoose = require('mongoose');
const Rendez_vousSchema = new mongoose.Schema({
    date_rdv: { type: timestamps, required: true },
    date_envoie: { type: timestamps, required: true },
    etat: { type: Int32Array, required: true },
    etat_rdv: { type: Int32Array, required: true },
    idvheicule: { type: mongoose.Schema.Types.ObjectId, required: true },
}, { timestamps: true });
module.exports = mongoose.model('rendez_vous', Rendez_vousSchema);
