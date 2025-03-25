const Payement=require('../models/Payement')
const getChiffreAffairepaAnnee = async (req, res) => {
    const value=await Payement.aggregate([
        {
            $group:{
                _id:{annee: { $dateToString: { format: "%Y", date: { $toDate: "$date" } } }},
                total:{$sum:"$prix"}
            }
        }
    ]);
    return value;
}

const getChiffreAffaireparMoi = async (req, res) => {
    const value=await Payement.aggregate([
        {
            $group:{
                _id:{mois: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } }},
                total:{$sum:"$prix"}
            }
        }
    ]);
    return value;
}
const getChiffreAffaireparJour=async(req,res)=>{

}

module.exports={getChiffreAffaireparJour,getChiffreAffaireparMoi};