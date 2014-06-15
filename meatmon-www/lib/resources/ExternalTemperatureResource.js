var Autowire = require("wantsit").Autowire;

ExternalTemperature = function() {
  this._logger = Autowire;
  this._externalTemperatureRepository = Autowire;
};

ExternalTemperature.prototype.retrieveAll = function(request, response) {
  this._externalTemperatureRepository.findAll(function(error, result) {
    if(error) throw error

    response.json(result)
  })
};

ExternalTemperature.prototype.create = function(request, response) {
  this._externalTemperatureRepository.save({
    date: new Date(),
    celsius: request.body.celsius
  }, function(error) {
    if(error) {
      console.error(error)
      response.status(500)

      return
    }

    response.status(201)
  })
};

module.exports = ExternalTemperature;
