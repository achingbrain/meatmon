var Autowire = require("wantsit").Autowire;

InternalTemperature = function() {
  this._logger = Autowire;
  this._internalTemperatureRepository = Autowire;
};

InternalTemperature.prototype.retrieveAll = function(request, response) {
  this._internalTemperatureRepository.findAll(function(error, result) {
    if(error) throw error

    response.json(result)
  })
};

InternalTemperature.prototype.create = function(request, response) {
  this._internalTemperatureRepository.save({
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

module.exports = InternalTemperature;
