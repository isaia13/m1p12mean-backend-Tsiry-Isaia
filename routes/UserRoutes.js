const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRoles } = require('../configuration/VerificationToken');
require('dotenv').config();
const mongoose = require('mongoose');
// faire un login
router.post('/login', async (req, res) => {
    try {
        const user = new User(req.body);
        const users = await User.findOne({ $or: [{ username: user.username }, { email: user.email }] });
        if (users) {
            const isMatch = await bcrypt.compare(user.password, users.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Mot de passe incorrect" });
            } else {
                const token = jwt.sign(
                    { userId: users._id, role: users.role ,email:users.email},
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );
                return res.status(200).json({
                    message: 'Connexion réussie',
                    token,
                    user: {
                        id : users._id,
                        username: users.username,
                        email: users.email,
                        role : users.role
                    }
                });
            }
        } else {
            res.status(404).json({ message: "Utilisateur non existant veuiller s'inscrire" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

router.put('/update/:id', async (req, res) => {
    const { username, email, password, new_password } = req.body;

    try {
        const users = await User.findById(new mongoose.Types.ObjectId(req.params.id));
        if (users) {
            const isMatch = await bcrypt.compare(password, users.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Mot de passe incorrect" });
            } else {
                users.username = username || users.username;
                users.email = email || users.email;
            
                if (new_password) {
                  users.password = new_password;
                }
                await users.save();
                console.log('Profil mis à jour avec succès');
                res.status(200).json({ message: 'Profil mis à jour avec succès'});
            }
        } else {
            res.status(404).json({ message: 'Utilisateur non existant veuiller se connecter' })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/register', async (req, res) => {
    try {

        const user = new User(req.body);
        const liste = await User.find({ $or: [{ username: user.username }, { email: user.email }] });
        if (liste.length > 0) {
            return res.status(400).json({ message: "Utilisateur existant" });
        } else {
            console.log(user.password);
            if (typeof user.password !== 'string') {
                return res.status(400).json({ message: "Le mot de passe doit être une chaîne de caractères !" });
            }
            await user.save();
            res.json(user)
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});
router.get('/', async (req, res) => {
    try {
        const liste = await User.find();
        res.status(200).json(liste);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur du serveur' });
    }
});

router.put('/article', authenticateToken, authorizeRoles(['user']), async (req, res) => {
    try {
        const user = new User(req.user);
        const article = req.body;
        const result = await User.findOneAndUpdate(
            { username: user.username },
            { $push: { article: { $each: article } } },
            { new: true }
        );
        // if (result) {
        res.status(200).json({ message: 'Commandes ajoutées avec succès', user: user, article: article });
        // } else {
        //     console.log('tsy aaa')
        // }
        // res.json(user)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});




module.exports = router;