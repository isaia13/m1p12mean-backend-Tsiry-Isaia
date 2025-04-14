const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcryptjs = require('bcryptjs'); 
const WebSocket = require('ws');
require('dotenv').config();
const http = require('http');

const {
  startRdvUpdater, startListRdv, startRdvServices, startListServiceRdv
} = require('../service/ws/rdv_ws'); 

const {
  startCountRdvServices, getChangeHistoRdv
} = require('../service/ws/histo_rdv_ws');

const {
  startSuiviServicesTerminer, getListAvancementeVehicule
} = require('../service/ws/suivi_ws');

const {
  startCountServicesPayementRecu
} = require('../service/ws/payement_ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const clients = new Set();

wss.on('connection', (socket) => {
  console.log('🟢 Client connecté via WebSocket');
  clients.add(socket);

  socket.on('close', () => {
    clients.delete(socket);
    console.log('🔴 Client déconnecté du WebSocket');
  });
});

app.locals.clients = clients;
startRdvUpdater(clients);
startListRdv(clients);
startRdvServices(clients);
startListServiceRdv(clients);
startCountRdvServices(clients);
getChangeHistoRdv(clients);
startSuiviServicesTerminer(clients);
getListAvancementeVehicule(clients);
startCountServicesPayementRecu(clients);

const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://localhost:4200',
    "https://projet-mean-front.onrender.com",
    "https://m1p12mean-frontend-tsiry-isaia.onrender.com"
  ],
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization'
}));
app.use(express.json());

// ✅ Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connecté"))
  .catch(err => console.log("❌ MongoDB erreur:", err));

// ✅ Routes
var route = '/api';

app.use(route + '/user', require('../routes/UserRoutes'));
app.use(route + '/vehicule', require('../routes/VehiculeController'));
app.use(route + '/rendez-vous', require('../routes/Rendez_vousController'));
app.use(route + '/service', require('../routes/ServiceController'));
app.use(route + '/depense', require('../routes/DepenseController'));
app.use(route + '/rdv', require('../routes/RendezVousRoute'));
app.use(route + '/vehicules', require('../routes/VehiculeRoute'));
app.use(route + '/services', require('../routes/ServiceRoute'));
app.use(route + '/payement', require('../routes/PayementController'));

// ✅ Démarrer serveur HTTP + WS
server.listen(PORT, () => {
  console.log(`🚀 Serveur HTTP & WebSocket lancé sur le port ${PORT}`);
});
