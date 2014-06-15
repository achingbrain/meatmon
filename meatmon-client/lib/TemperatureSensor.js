var EventEmitter = require('events').EventEmitter,
  util = require('util')

// always a factor of 5
const FUDGE_FACTOR = (2 * 5) * -1

var TemperatureSensor = function(name, board, pin) {
  EventEmitter.call(this)

  // turn on reporting for that pin
  board.io.reportAnalogPin(pin, 1)

  var measurements = 0
  var temporary = 0
  this._temperature = 0

  board.analogRead(pin, function(value) {
    var voltage = value * (5.0 / 1023.0);
    var temp = (voltage - 1.25) / 0.005;

    temporary += temp
    measurements++

    if(measurements == 10) {
      measurements = 0
      this._temperature = parseInt(temporary/10, 10)
      this._temperature += FUDGE_FACTOR
      temporary = 0

      console.info(name, 'temperature', this._temperature, '°C')
    }
  }.bind(this))
}
util.inherits(TemperatureSensor, EventEmitter)

TemperatureSensor.prototype.getTemperature = function() {
  return this._temperature
}

module.exports = TemperatureSensor
