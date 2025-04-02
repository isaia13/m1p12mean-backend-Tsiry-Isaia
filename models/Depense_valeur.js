const mongoose = require('mongoose');
const Depense_valeurSchema = new mongoose.Schema({
    depense:{ type: mongoose.Schema.Types.ObjectId, ref: "Depense", required:true},
    prix:{type:Number,min:[0.0,'Ne peut pas etre negatif']},
    date: {
        type: Date,
        default: () => Date.now() 
      }
}, { timestamps: true });
module.exports = mongoose.model('Depense_valeur', Depense_valeurSchema);
