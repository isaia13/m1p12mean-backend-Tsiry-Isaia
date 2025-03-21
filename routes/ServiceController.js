const express = require('express');
const router = express.Router();
const Service=require('../models/Service')
const {authenticateToken,authorizeRoles}=require('../configuration/VerificationToken');


router.post('/',authenticateToken,authorizeRoles(['manager']), async (req, res) => {
    try {
        const service = new Service(req.body);
        await service.save();
        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.put('/:id',authenticateToken,authorizeRoles(['manager']), async (req, res) => {
    try {
        const service = await Service.findOne({
            _id: new mongoose.Types.ObjectId(req.params.id)});
        if(!service){
            return { success: false, message: "Service non trouvé ou vous n'êtes pas autorisé à le modifier." };
        }
        const serviceUpdate = await Service.findByIdAndUpdate(req.params.id,
            req.body, { new: true });
        res.status(201).json(serviceUpdate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id',authenticateToken,authorizeRoles(['manager']),async (req, res) => {
    try {
        const service = await Service.findOne({
            _id: new mongoose.Types.ObjectId(req.params.id)});
        if(!service){
            return { success: false, message: "Service non trouvé ou vous n'êtes pas autorisé à le modifier." };
        }
        const serviceSuppression = await Service.findByIdAndUpdate(
            req.params.id, 
            { etat: 1 },
            { new: true } 
        );
        res.status(201).json({message:"suppression avec succes"});
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.put('/ajout-mecanicien:id',authenticateToken,authorizeRoles(['manager']),async (req, res) => {
    try {
        const service = await Service.findOne({
            _id: new mongoose.Types.ObjectId(req.params.id)});
        if(!service){
            return { success: false, message: "Service non trouvé ou vous n'êtes pas autorisé à le modifier." };
        }
        const result = await Service.findOneAndUpdate(
            { _id: req.params.id },
            { $push: { mecanicien: { $each: mecanicien } } },
            { new: true }
        );
        res.status(201).json({message:"Assination  de role   avec succes"});
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



module.exports=router;