var Autowire = require('wantsit').Autowire

var HomeController = function() {
  this._config = Autowire
  this._internalTemperatureRepository = Autowire;
  this._internalTemperatureResource = Autowire;
  this._externalTemperatureResource = Autowire;
}

HomeController.prototype.get = function(request, response) {
  var targetTemperature = 80
  var sampleSize = 50

  this._internalTemperatureRepository.findAll(function(error, result) {

    if(result.length < sampleSize) {
      ready = "Not enough data yet.."
    } else {
      var startTemp = result[result.length - sampleSize].celsius
      var startTime = new Date(result[result.length - sampleSize].date)
      var currentTemp = result[result.length - 1].celsius
      var currentTime = new Date(result[result.length - 1].date)
      var seconds = (currentTime.getTime() - startTime.getTime()) / 1000
      var temperatureDiff = currentTemp - startTemp
      var increasePerSeconds = temperatureDiff/seconds
      var requiredDiff = targetTemperature - currentTemp
      var readyInSeconds = requiredDiff/increasePerSeconds
      var ready = new Date(Date.now() + (readyInSeconds * 1000))

      if(ready.getTime() < Date.now()) {
        ready = "Now!"
      }
    }

    response.render('home', {
      internalTemperature: this._internalTemperatureResource.getLastTemperature(),
      externalTemperature: this._externalTemperatureResource.getLastTemperature(),
      ready: ready
    })
  }.bind(this))
}

module.exports = HomeController
