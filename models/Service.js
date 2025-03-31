const mongoose = require('mongoose');
const ServiceSchema = new mongoose.Schema({
nom: { type: String, required: true },
prix_annulation:{type:Number,required:true,default:0},
promotion:[{type:Object, default :[]}],
mecanicien:[{ type: mongoose.Schema.Types.ObjectId, ref: "user", default: [] }],
etat :{type:Number,default :0}
}, { timestamps: true });
module.exports = mongoose.model('service', ServiceSchema);
