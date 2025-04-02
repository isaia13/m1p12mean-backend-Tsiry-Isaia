const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prix_annulation: { type: Number, required: true, default: 0 },
    promotion: [{ type: Object, default: [] }],
    mecanicien: [{ type: mongoose.Schema.Types.ObjectId, ref: "user", default: [] }],
    etat: { type: Number, default: 0 },
    sousServices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sous_Service" }] // Ajout du champ
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
