const express = require('express');
const moment = require('moment');
const axios = require('axios');
const { Parser } = require('xml2js');
let router = express.Router();

router.get('/data', async (req, res, next) => {
    let rivers = {};
    rivers.skykomish = await getRiverData('https://water.weather.gov/ahps2/hydrograph_to_xml.php?gage=glbw1&output=xml');
    rivers.skykomish.annotations = {
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
                content: 'GET A BOAT'
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
                content: 'Cedar/Intake only unless ballsy'
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
                content: 'Perfect. All holes accessible.'
            },
            scaleID: 'y',
            value: 7
        }
    };
    rivers.snohomish = await getRiverData('https://water.weather.gov/ahps2/hydrograph_to_xml.php?gage=mrow1&output=xml');
    res.json(rivers);
});

async function getRiverData(url) {
    let xmlRes = await axios.get(url);
    if (!xmlRes.data)
        return res.json({ error: 'Error parsing data from source.' });
    let parser = new Parser({ explicitArray: false });
    let riverData = await parser.parseStringPromise(xmlRes.data);
    if (!riverData || !riverData.site || !riverData.site.observed || !riverData.site.observed || !riverData.site.observed.datum)
        return res.json({ error: 'Observed data is missing.' });
    let dataPoints = [];
    let observed = riverData.site.observed.datum;
    for (let i = 0; i < observed.length; i++) {
        if (!observed[i])
            continue;
        dataPoints.push({
            prediction: false,
            timeString: moment(observed[i].valid._).utc().local().format('DD/MM/YYYY hh:mm:ss'),
            timestamp: Number(moment(observed[i].valid._).utc().local().valueOf()),
            level: observed[i].primary._,
            flow: observed[i].secondary._
        });
    }
    let forecast = riverData.site.forecast.datum;
    for (let i = 0; i < forecast.length; i++) {
        if (!forecast[i])
            continue;
        dataPoints.push({
            prediction: true,
            timeString: moment(forecast[i].valid._).utc().local().format('DD/MM/YYYY hh:mm:ss'),
            timestamp: Number(moment(forecast[i].valid._).utc().local().valueOf()),
            level: forecast[i].primary._,
            flow: forecast[i].secondary._
        });
    }
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
    dataPoints.forEach(point => {
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
    return {
        data,
        minTime, maxTime,
        minFlow, maxFlow,
        minLevel, maxLevel
    };
}

module.exports = router;