var Autowire = require('wantsit').Autowire

var HomeController = function() {
  this._config = Autowire
}

HomeController.prototype.get = function(request, response) {
  response.render('home', {})
}

module.exports = HomeController
