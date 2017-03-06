'use strict'

const fs = require('fs');
const fb = require('fb');
const https = require('https');
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const app = express();

const conf = require('./secrets/conf.js');
const interaction = require('./bot/interaction.js');
const postservice = require('./bot/postservice.js');

app.use(bodyParser.json());

app.set('port',(process.env.PORT || conf.PORT));

//setup letsencrypt
var SSL_CONF = {
    key : fs.readFileSync(conf.SSL.KEY),
    cert : fs.readFileSync(conf.SSL.CERT),
    ca : fs.readFileSync(conf.SSL.CA)
};


fb.setAccessToken(conf.ACCESS_TOKEN);

function startServer() {
    https.createServer(SSL_CONF, app).listen(app.get('port'), function (){
        console.log('Server running.');
    });

    app.get('/','The Same Photo of Michael Christie Every Day');
    app.get('/webhook', interaction.initializeBot);
    app.post('/webhook', interaction.handleMessage);
}

var rule = new schedule.RecurrenceRule();
rule.hour = 17;
rule.minute = 0;

var postschedule = schedule.scheduleJob(rule, function(){
    postservice.makePost();
});

startServer();