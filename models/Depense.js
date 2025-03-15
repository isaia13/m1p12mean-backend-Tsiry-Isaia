const mongoose = require('mongoose');
const DepenseSchema = new mongoose.Schema({
nom: { type: String, required: true },
}, { timestamps: true });
module.exports = mongoose.model('Depense', DepenseSchema);
