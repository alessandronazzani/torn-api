var express = require('express'),
    _ = require('underscore'),
    torn = require('./routes/torn'),
    http = require('http'),
    path = require('path'),
    app = express();

if (process.env.PARAM1)
  app.set('env',process.env.PARAM1);

console.log('ENV: '+app.get('env'));

// all environments
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json())
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(app.router);
app.use('/', express.static(path.join(__dirname, 'client')));

app.get('/api/torn/list', torn.list);
app.get('/api/torn/faction', torn.faction);

module.exports = app;
