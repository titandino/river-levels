const express = require('express');
const moment = require('moment');
const axios = require('axios');
const { Parser } = require('xml2js');
let router = express.Router();

router.get('/data', async (req, res, next) => {
    let xmlRes = await axios.get('https://water.weather.gov/ahps2/hydrograph_to_xml.php?gage=glbw1&output=xml');
    if (!xmlRes.data)
        return res.json({ error: 'Error parsing data from source.' });
    let parser = new Parser({ explicitArray: false });
    let riverData = await parser.parseStringPromise(xmlRes.data);
    if (!riverData || !riverData.site || !riverData.site.observed || !riverData.site.observed || !riverData.site.observed.datum)
        return res.json({ error: 'Observed data is missing.' });
    let dataPoints = [];
    let observed = riverData.site.observed.datum;
    for (let i = 0;i < observed.length;i++) {
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
    for (let i = 0;i < forecast.length;i++) {
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
    res.json(dataPoints);
});

module.exports = router;