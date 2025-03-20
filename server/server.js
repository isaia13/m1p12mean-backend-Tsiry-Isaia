const express = require('express');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const app = express();
const http = require('http');
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Un client est connecté.');

  // Envoyer un message au client lorsque la connexion est établie
  ws.send(JSON.stringify({ message: 'Connexion établie avec le serveur WebSocket' }));

  // Simuler des mises à jour (par exemple, tous les 5 secondes)
  setInterval(() => {
    ws.send(JSON.stringify({ message: 'Mise à jour en temps réel!' }));
  }, 5000);

  // Gérer les messages reçus du client
  ws.on('message', (message) => {
    console.log('Message du client:', message);
  });

  ws.on('close', () => {
    console.log('Connexion fermée');
  });
});

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'https://projet-mean-front.onrender.com'],
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));

app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connecté"))
  .catch(err => console.log(err));

const route = '/api';

app.use(route+'/user', require('../routes/UserRoutes'));
app.use(route + '/rdv', require('../routes/RendezVousRoute'));
app.use(route + '/vehicules', require('../routes/VehiculeRoute'));
app.use(route + '/service', require('../routes/ServiceRoute'));
// app.use(route + '/articles', require('../routes/ArticleRoute'));

// Démarrer le serveur HTTP et WebSocket sur le même port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
