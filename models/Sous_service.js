const mongoose = require('mongoose');
const Sous_ServiceSchema = new mongoose.Schema({
    Service: { type: mongoose.Schema.Types.ObjectId, ref: "Sous_Service", required: true },
    prix: { type: Number, required: true, min: [0.0, 'Ne peut pas etre negatif'] },
    nom: { type: String, default: '' },
    commission: { type: Number, min: [0.0, 'Ne peut pas etre negatif'] },
}, { timestamps: true });
module.exports = mongoose.model('Sous_Service', Sous_ServiceSchema);
