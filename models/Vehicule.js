const mongoose = require('mongoose');
const VehiculeSchema = new mongoose.Schema({
    marque: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref:"User",required: true },
    caracteristique: { type: Object, required: true },
    date_insertion:{
        type: Number,
        default: () => Date.now() 
      ,required:true},
    etat:{type:Number,required:true,default:0},
    }, { timestamps: true });
module.exports = mongoose.model('Vehicule', VehiculeSchema);
