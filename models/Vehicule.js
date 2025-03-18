const mongoose = require('mongoose');
const VehiculeSchema = new mongoose.Schema({
    marque: { type: String, required: true },
    User: { type: mongoose.Schema.Types.ObjectId, ref:"User",required: true },
    Caractecristique: { type: Object, required: true },
    date_insertion:{type:Date,required:true},
    etat:{type:Number,required:true},
}, { timestamps: true });
module.exports = mongoose.model('Vehicule', VehiculeSchema);
