const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://localhost:1883')
const express = require('express');
const app = express();
const low = require('lowdb');
// const moment = require('moment');
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json');
const db = low(adapter);
const uuid = require('uuid');
const serveStatic = require('serve-static');
const history = require('connect-history-api-fallback');

var serverPort = 3000;
var port = process.env.PORT || serverPort;

db.defaults({ posts: [], user: {}, count: 0 })
  .write()

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/api', (req, res) => {
  res.send(db.get('posts'));
});

client.on('connect', function () {
  client.subscribe('home/rtl_433', function (err) {
    if (!err) {
      client.publish('home/rtl_433', 'Hello mqtt')
    }
  })
})

client.on('message', function (topic, message) {
  // message is Buffer
  var stringBuf = message && message.toString('utf-8')
  try {
    var json = JSON.parse(stringBuf);
    console.log(json);
    // Add a post
    if (json.temperature_C && json.humidity) {
      db.get('posts')
        .push({ id: uuid.v1(), temp: json.temperature_C, humidity: json.humidity, time: json.time })
        .write()
      db.update('count', n => n + 1)
        .write()
    }
  } catch (e) {
    console.log(stringBuf);
  }
})

app.use(history());
app.use(serveStatic(__dirname + '/dist/spa-mat'));
app.listen(port, () => console.log('App listening on port ', port));
