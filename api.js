import express from 'express';
import moment from 'moment';
import fetch from 'node-fetch';
let router = express.Router();

const SKYKOMISH = 'GLBW1';
const SNOHOMISH = 'SNAW1'

router.get('/data', async (req, res, next) => {
    let rivers = {};
    rivers.skykomish = await getRiverData(SKYKOMISH);
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
    rivers.snohomish = await getRiverData(SNOHOMISH);
    res.json(rivers);
});

async function getRiverData(gaugeId) {
    let response = await fetch(`https://api.water.noaa.gov/nwps/v1/gauges/${gaugeId}/stageflow`);
    if (!response)
        throw new Error('Error parsing data from source.')
    let riverData = await response.json();
    if (!riverData || !riverData.observed)
        throw new Error('Observed data is missing.')
    let dataPoints = [];
    let observed = riverData.observed.data;
    for (let i = 0; i < observed.length; i++) {
        if (!observed[i])
            continue;
        dataPoints.push({
            prediction: false,
            timeString: moment(observed[i].validTime).utc().local().format('DD/MM/YYYY hh:mm:ss'),
            timestamp: Number(moment(observed[i].validTime).utc().local().valueOf()),
            level: observed[i].primary,
            flow: observed[i].secondary
        });
    }
    let forecast = riverData.forecast.data;
    for (let i = 0; i < forecast.length; i++) {
        if (!forecast[i])
            continue;
        dataPoints.push({
            prediction: true,
            timeString: moment(forecast[i].validTime).utc().local().format('DD/MM/YYYY hh:mm:ss'),
            timestamp: Number(moment(forecast[i].validTime).utc().local().valueOf()),
            level: forecast[i].primary,
            flow: forecast[i].secondary
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

export default router;