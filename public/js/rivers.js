//Snohomish river: https://water.weather.gov/ahps2/hydrograph_to_xml.php?gage=mrow1&output=xml
$.getJSON('/api/data', function (rivers) {
  createRiverChart(rivers.skykomish, 'Wallace/Skykomish');
  createRiverChart(rivers.snohomish, 'Snohomish');
});

function createRiverChart(river, riverTitle) {
  const canvas = document.createElement('canvas');
  document.getElementById('chart-container').appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const chart = new Chart(ctx, generateChartData(river, riverTitle));
}

function generateChartData(river, riverTitle) {
  return {
    type: 'line',
    data: river.data,
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
          text: riverTitle
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
            ...river.annotations
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

          min: river.minTime,
          max: river.maxTime
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
          suggestedMin: river.minLevel,
          suggestedMax: river.maxLevel
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
          suggestedMin: river.minFlow,
          suggestedMax: river.maxFlow
        }
      }
    },
  };
}

