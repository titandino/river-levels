//Snohomish river: https://water.weather.gov/ahps2/hydrograph_to_xml.php?gage=mrow1&output=xml
$.getJSON('/api/data', function(riverData) {
  const ctx = document.getElementById('chart').getContext('2d');
  let data = {
    labels: ['Level (feet)', 'Flow (kcfs)'],
    datasets: [{
      label: 'Level',
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
      yAxisID: 'y'
    },
    {
      hidden: true,
      label: 'Flow',
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
      yAxisID: 'y1'
    }]
  };
  let minTime = Number.MAX_VALUE, maxTime = 0;
  let minLevel = Number.MAX_VALUE, maxLevel = 0;
  let minFlow = Number.MAX_VALUE, maxFlow = 0;
  riverData.forEach(point => {
    if (point.timestamp < minTime)
      minTime = point.timestamp;
    if (point.timestamp > maxTime)
      maxTime = point.timestamp;

    if (point.level < minLevel)
      minLevel = point.level;
    if (point.level > maxLevel)
      maxLevel = point.level;

    if (point.flow < minFlow)
      minFlow = point.flow;
    if (point.flow > maxFlow)
      maxFlow = point.flow;

    data.datasets[0].data.push({
      x: point.timestamp,
      y: point.level
    });
    data.datasets[0].backgroundColor.push(point.prediction ? 'rgba(0, 189, 252, 0.1)' : 'rgba(0, 120, 160, 0.1)');
    data.datasets[0].borderColor.push(point.prediction ? 'rgba(0, 189, 252, 0.4)' : 'rgba(0, 120, 160, 0.4)');

    data.datasets[1].data.push({
      x: point.timestamp,
      y: point.flow
    });
    data.datasets[1].backgroundColor.push(point.prediction ? 'rgba(0, 128, 100, 0.2)' : 'rgba(0, 255, 100, 0.2)');
    data.datasets[1].borderColor.push(point.prediction ? 'rgba(0, 128, 100, 1)' : 'rgba(0, 255, 100, 1)');
  });
  const chart = new Chart(ctx, {
    type: 'line',
    data,
    options: {
      elements: {
        line: {
          tension: 0.4,
        }
      },
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Wallace/Skykomish River Level'
        },
        annotation: {
          annotations: {
            today: {
              type: 'line',
              borderColor: 'grey',
              borderWidth: 1,
              display: (ctx) => ctx.chart.isDatasetVisible(0) || ctx.chart.isDatasetVisible(1),
              label: {
                display: true,
                content: 'Now',
                position: 'start'
              },
              scaleID: 'x',
              value: Date.now()
            },
            getABoat: {
              type: 'line',
              borderColor: 'rgb(200, 0, 0)',
              borderDash: [6, 6],
              borderDashOffset: 0,
              borderWidth: 3,
              label: {
                position: 'end',
                display: true,
                backgroundColor: 'rgb(128, 0, 0)',
                content: (ctx) => 'GET A BOAT'
              },
              scaleID: 'y',
              value: 13
            },
            waders: {
              type: 'line',
              borderColor: 'rgb(234, 134, 4)',
              borderDash: [6, 6],
              borderDashOffset: 0,
              borderWidth: 3,
              label: {
                position: 'end',
                display: true,
                backgroundColor: 'rgb(234, 134, 4)',
                content: (ctx) => 'Cedar/Intake only unless ballsy'
              },
              scaleID: 'y',
              value: 9
            },
            waders2: {
              type: 'line',
              borderColor: 'rgb(47, 181, 3)',
              borderDash: [6, 6],
              borderDashOffset: 0,
              borderWidth: 3,
              label: {
                position: 'end',
                display: true,
                backgroundColor: 'rgb(47, 181, 3)',
                content: (ctx) => 'Perfect. All holes accessible.'
              },
              scaleID: 'y',
              value: 7
            }
          }
        }
      },
      interaction: {
        intersect: false,
      },
      scales: {
        x: {
          display: true,
          type: 'time',
          time: {
            displayFormats: {
                quarter: 'MMM DD hh:mm'
            }
          },
          title: {
            text: 'Time',
            display: true
          },
          
          min: minTime,
          max: maxTime
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Level'
          },
          ticks: {
            callback: (val, i, ticks) => val + ' ft.'
          },
          suggestedMin: minLevel,
          suggestedMax: maxLevel
        },
        y1: {
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Flow'
          },
          ticks: {
            callback: (val, i, ticks) => val + ' kcfs'
          },
          suggestedMin: minFlow,
          suggestedMax: maxFlow
        }
      }
    },
  });
});
