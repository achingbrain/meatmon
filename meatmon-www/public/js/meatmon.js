console.info('Loading temperature data')

async.parallel([
  function(callback) {
    $.getJSON('/externalTemperatures', function(data) {
      callback(null, data)
    })
  },
  function(callback) {
    $.getJSON('/internalTemperatures', function(data) {
      callback(null, data)
    })
  }
], function(error, results) {
  if(error) return console.error(error)

  $('#container').highcharts({
    title: {
      text: 'MeatMon',
      x: -20 //center
    },
    xAxis: {
      title: {
        text: 'Time'
      }
    },
    yAxis: {
      title: {
        text: 'Temperature (°C)'
      },
      plotLines: [{
        value: 0,
        width: 1,
        color: '#808080'
      }]
    },
    tooltip: {
      valueSuffix: '°C'
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
      borderWidth: 0
    },
    series: [{
      name: 'External',
      data: toSeries(results[0])
    }, {
      name: 'Internal',
      data: toSeries(results[1])
    }]
  });
})

var toSeries = function(data) {
  var output = []

  data.forEach(function(datum) {
    output.push([datum.date, datum.celsius])
  })

  return output
}