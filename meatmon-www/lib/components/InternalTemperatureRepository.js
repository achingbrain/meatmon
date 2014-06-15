var Autowire = require('wantsit').Autowire,
  fs = require('fs'),
  util = require('util'),
  Repository = require('nano-repository')

var InternalTemperatureRepository = function() {
  this._config = Autowire
  this._logger = Autowire
  this._db = Autowire({name: 'internalTemperatureDb'})
}
util.inherits(InternalTemperatureRepository, Repository)

InternalTemperatureRepository.prototype.afterPropertiesSet = function() {
  this.updateViews(__dirname + '/InternalTemperatureRepository.json', function(error) {
    // views are now ready to use
  });
}

module.exports = InternalTemperatureRepository