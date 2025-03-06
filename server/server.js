const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcryptjs = require('bcryptjs'); 
require('dotenv').config();

const app = express();


const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin:'http://localhost:5000',
  methods:'GET,POST,PUT,DELETE',
  allowedHeaders:'Content-Type,Authorization'
}));
app.use(express.json());



mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connecté"))
  .catch(err => console.log(err));

var route = '/api';

app.use(route+'/user', require('../routes/UserRoutes'));
// app.use(route + '/articles', require('../routes/ArticleRoute'));

// Démarrage du serveur
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
