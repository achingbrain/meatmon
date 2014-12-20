var config = {
    rest: {
      port: 15000,
      host: 'localhost'
    },
    arduino: {
      device: '/dev/tty.usbserial-A603HIUN',
      port: 5984
    }
  },
  five = require('johnny-five'),
  restify = require('restify'),
  temperatureSensor = require('./lib/temperatureSensor')

var client = restify.createJsonClient({
  url: 'http://' + config.rest.host + ':' + config.rest.port
})

console.info('Connecting to', config.arduino.device)
var board = new five.Board({port: config.arduino.device})
board.on('ready', function() {
  console.info('Connected to', config.arduino.device)

  // setup internal temperature monitor
  var internalTemperatureSensor = temperatureSensor(board, 3, -36)
  internalTemperatureSensor.on('temperature', function(temperature) {
    console.info('Posting internal temperature %d°C', temperature);

    client.post('/internalTemperatures', {
      celsius: temperature
    }, function(error) {
      if(error) console.error(error)
    })
  })

  // setup external temperature
  var externalTemperatureSensor = temperatureSensor(board, 4, -36)
  externalTemperatureSensor.on('temperature', function(temperature) {
    console.info('Posting external temperature %d°C', temperature);

    client.post('/externalTemperatures', {
      celsius: temperature
    }, function(error) {
      if(error) console.error(error)
    })
  })
})
