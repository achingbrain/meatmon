var Autowire = require('wantsit').Autowire,
  fs = require('fs'),
  util = require('util'),
  Repository = require('nano-repository')

var ExternalTemperatureRepository = function() {
  this._config = Autowire
  this._logger = Autowire
  this._db = Autowire({name: 'externalTemperatureDb'})
}
util.inherits(ExternalTemperatureRepository, Repository)

ExternalTemperatureRepository.prototype.afterPropertiesSet = function() {
  this.updateViews(__dirname + '/ExternalTemperatureRepository.json', function(error) {
    // views are now ready to use
  });
}

module.exports = ExternalTemperatureRepository