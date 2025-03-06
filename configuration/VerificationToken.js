const jwt = require('jsonwebtoken');
require('dotenv').config(); // Charger les variables d'environnement depuis .env

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Accès refusé. Veuillez vous connecter.' });
    }

    // Vérifier la validité du token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide' });
        }

        // Ajout des informations de l'utilisateur au `req` pour une utilisation dans la route
        req.user = decoded;
        next(); // Passer à la prochaine étape de la route
    });
};
const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Accès interdit" });
        }
        next();
    };
};

module.exports = {authenticateToken,authorizeRoles};
