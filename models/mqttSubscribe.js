var mqtt = require('mqtt')

var options = {
  host: 'e52163660ddf453cb4355b09a11a0678.s1.eu.hivemq.cloud',
  port: 8883,
  protocol: 'mqtts',
  username: 'hivemq.webclient.1693586254057',
  password: 'OU,*8Xn&2D5LKutlo;v9'
}

// initialize the MQTT client
var client = mqtt.connect(options);

// setup the callbacks
client.on('connect', function () {
    console.log('Connected');
});

client.on('message', function (topic, message) {
    // called each time a message is received
    // Parse the MQTT message into a JavaScript object
    const messageObject = JSON.parse(message);
});

// subscribe to topic 'my/test/topic'
client.subscribe('FUEL_TANK');

module.exports = client;