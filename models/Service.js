const mongoose = require('mongoose');
const ServiceSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prix_annulation: { type: Number, required: true, default: 0 },
    promotion: [{ type: Object, default: [] }],
    mecanicien: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }]
}, { timestamps: true });

module.exports = mongoose.model('service', ServiceSchema);
