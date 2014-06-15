var config = require('rc')('meatmon-www', {
    rest: {
      port: 15000,
      host: 'localhost'
    },
    arduino: {
      device: '/dev/tty.usbserial-A603HIUN',
      port: 5984
    }
  }),
  five = require('johnny-five'),
  restify = require('restify'),
  TemperatureSensor = require('./lib/TemperatureSensor')

var client = restify.createJsonClient({
  url: 'http://' + config.rest.host + ':' + config.rest.port
})

console.info('Connecting to', config.arduino.device)
var board = new five.Board({port: config.arduino.device})
board.on('ready', function() {
  console.info('board ready')

  var internalTemperatureSensor = new TemperatureSensor('Internal', board, 3)
  var externalTemperatureSensor = new TemperatureSensor('External', board, 4)

  setInterval(function() {
    console.info('Posting internal temperature', internalTemperatureSensor.getTemperature(), '°C, external temperature', externalTemperatureSensor.getTemperature(), '°C');

    client.post('/internalTemperatures', {
      celsius: internalTemperatureSensor.getTemperature()
    }, function(error) {
      if(error) console.error(error)
    })

    client.post('/externalTemperatures', {
      celsius: externalTemperatureSensor.getTemperature()
    }, function(error) {
      if(error) console.error(error)
    })
  }, 60000)
})
