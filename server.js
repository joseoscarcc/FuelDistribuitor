const express = require('express');
const WebSocket = require('ws');
const mqtt = require('mqtt');
const mongoose = require('mongoose')

const FuelTank = require('./models/fuelTank');
const fuelTank = new FuelTank();
// Create an Express app
const app = express();
const server = require('http').createServer(app);

// Create a WebSocket server
const wss = new WebSocket.Server({ server });
app.set('view engine', 'ejs');

mongoose.connect('mongodb://127.0.0.1/fuelTank');

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

var options = {
  host: 'bd846e75ffdd405ca23015c5edaa1c75.s1.eu.hivemq.cloud',
  port: 8883,
  protocol: 'mqtts',
  username: 'hivemq.webclient.1698692932843',
  password: 'BF6.YTl$@zD5o7j&v0Cx'
}
// Connect to an MQTT broker
const client = mqtt.connect(options);

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe('FUEL_TANK');
});

client.on('message', (topic, message) => {
  
  const mqttData = JSON.parse(message);
  const tankHeight = mqttData.height;
  if (tankHeight < 0.3 * 1024) {
    console.log(`Received message ${tankHeight} from topic ${topic}`);
    fuelTank.updateHeight(tankHeight); 
  }
  //
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ tankHeight }));
    }
  });
});

wss.on('connection', (ws) => {
  console.log('WebSocket connection opened');
});

app.get('/', (req, res) => {
  res.render('animation/index');
});

server.listen(3001, () => {
  console.log('Server started on port 3001');
});