var config = require('rc')('meatmon-www', {
    www: {
      port: 15000,
      host: '0.0.0.0'
    },
    couchdb: {
      host: 'localhost',
      port: 5984
    }
  }),
  Container = require('wantsit').Container,
  winston = require('winston'),
  Express = require('express'),
  expressHbs = require('express3-handlebars'),
  http = require('http'),
  Columbo = require('columbo'),
  Nano = require('nano'),
  bodyParser = require('body-parser')

var WWW = function() {
  // create container
  this._container = new Container()

  // set up logging
  var logger = this._container.createAndRegister('logger', winston.Logger, {
    transports: [
      new (winston.transports.Console)({
        timestamp: true,
        colorize: true
      })
    ]
  })

  // parse configuration
  this._container.register('config', config)

  // database
  var connection = new Nano('http://' + config.couchdb.host + ':' + config.couchdb.port)
  this._container.register('connection', Nano);

  // create collections
  connection.db.create('meatmon_external_temperature');
  this._container.register('externalTemperatureDb', connection.use('meatmon_external_temperature'));

  connection.db.create('meatmon_internal_temperature');
  this._container.register('internalTemperatureDb', connection.use('meatmon_internal_temperature'));

  // web controllers
  this._container.createAndRegisterAll(__dirname + '/components')
  this._container.createAndRegisterAll(__dirname + '/controllers')

  // create a REST api
  this._container.createAndRegister('columbo', Columbo, {
    resourceDirectory: __dirname + '/resources',
    resourceCreator: function(resource, name) {
      return this._container.createAndRegister(name + 'Resource', resource);
    }.bind(this),
    idFormatter: function(id) {
      return ":" + id;
    },
    optionsSender: function(options, request, response) {
      response.json(options);
    },
    logger: logger
  });

  // create express
  this._express = this._createExpress()
  this._server = http.createServer(this._express)

  // make errors a little more descriptive
  process.on('uncaughtException', function (exception) {
    logger.error('WWW', 'Uncaught exception', exception && exception.stack ? exception.stack : 'No stack trace available')

    throw exception
  }.bind(this))

  // make sure we shut down cleanly
  process.on('SIGINT', this.stop.bind(this))

  // make sure we shut down cleanly
  process.on('message', function(message) {
    if (message == 'shutdown') {
      this.stop()
    }
  })

  // make sure we shut down cleanly
  //process.on('exit', this.stop.bind(this, 'exit'))

  process.nextTick(function() {
    this._server.listen(this._express.get('port'), config.www.address, function() {
      logger.info('Express server listening on ' + this._server.address().address + ':' + this._server.address().port);
    }.bind(this));
  }.bind(this));
}

WWW.prototype._createExpress = function() {
  var port = process.env.PORT || config.www.port

  var express = Express()
  express.set('port', port)
  express.engine('handlebars', expressHbs({
    partialsDir: __dirname + '/views/partials',
    helpers: {}
  }))
  express.set('view engine', 'handlebars')
  express.set('views', __dirname + '/views')

  express.use(bodyParser.json())
  express.use(Express.static(__dirname + '/../public'))
  express.use('/lib',  Express.static(__dirname + '/../bower_components'))

  // create routes
  this._route(express, 'homeController', '/', 'get')

  var columbo = this._container.find('columbo')
  columbo.discover().forEach(function(resource) {
    express[resource.method.toLowerCase()](resource.path, resource.handler);
  })

  return express;
}

WWW.prototype._route = function(express, controller, url, method) {
  var component = this._container.find(controller)

  express[method](url, component[method].bind(component))
}

WWW.prototype.stop = function() {
  var logger = this._container.find('logger');
  logger.info('WWW', 'Shutting down Express')

  this._server.close(function() {
    logger.info('WWW', 'Express shut down.')
  })
}

module.exports = WWW;
