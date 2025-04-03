const mongoose = require('mongoose');
const bcrypt=require('bcryptjs')
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: {type:String,required:true},
    name:{type:String,required:true},
    prenom:{type:String},
    role: { type: String, enum: ['client', 'mecanicien','manager'], default: 'client' },
    photo:{type:String}
    }, { timestamps: true });
    UserSchema.pre('save', async function(next) {
        // Si le mot de passe est modifié, on le hache avant de le sauvegarder
        if (this.isModified('password')) {
            try {
                // Hasher le mot de passe avec bcryptjs
                const hashedPassword = await bcrypt.hash(this.password, 10);
                this.password = hashedPassword; // Remplacer le mot de passe par le haché
                next(); // Passer au prochain middleware ou à l'enregistrement
            } catch (error) {
                next(error); // Passer l'erreur au middleware suivant
            }
        } else {
            next(); // Si le mot de passe n'a pas été modifié, continuer
        }
    });

module.exports = mongoose.model('Utilisateur', UserSchema);