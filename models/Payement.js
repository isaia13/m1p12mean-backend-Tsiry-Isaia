const mongoose = require('mongoose');
const PayementSchema = new mongoose.Schema({
    rendez_vous:{ type: mongoose.Schema.Types.ObjectId, ref: "rendez_vous", required:true},
    prix: { type: Numeber, required: true ,min:[0.0,'La valeur devrat etre postif']},
    date: {
        type: Number,
        default: () => Date.now() 
    },
    etat:{ type: String, enum: ['en attente','recu'], default: 'en attente' }
}, { timestamps: true });
module.exports = mongoose.model('Payement', PayementSchema);
