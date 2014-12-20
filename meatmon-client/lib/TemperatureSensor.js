var EventEmitter = require('events').EventEmitter,
  util = require('util')

var TemperatureSensor = function(board, pin, fudgeFactor, interval) {
  EventEmitter.call(this)

  // how often to report the temperature
  interval = interval || 60000

  // turn on reporting for that pin
  board.io.reportAnalogPin(pin, 1)

  var measurements = 0
  var temporary = 0
  this._temperature = 0

  // read the temperature occasionally
  board.analogRead(pin, function(value) {
    var voltage = value * (5.0 / 1023.0);
    var temp = (voltage - 1.25) / 0.005;

    temporary += temp
    measurements++

    if(measurements == 10) {
      measurements = 0
      this._temperature = parseInt(temporary/10, 10)
      this._temperature += fudgeFactor
      temporary = 0
    }
  }.bind(this))

  setInterval(function() {
    this.emit('temperature', this._temperature)
  }.bind(this), interval)
}
util.inherits(TemperatureSensor, EventEmitter)

module.exports = function(board, pin, fudgeFactor, interval) {
  return new TemperatureSensor(board, pin, fudgeFactor, interval)
}
