var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://localhost:1883')
const express = require('express');
const app = express();
const low = require('lowdb');
const moment = require('moment');
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
var uuid = require('uuid');

db.defaults({ posts: [], user: {}, count: 0 })
  .write()

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  res.send(db.get('posts'));
});

app.get('/temp', (req, res) => {
  const data = db.get('posts').cloneDeep().value();
  let temp = [];
  data.forEach(obj =>
    temp.push(
      {
        temp: obj.temp,
        time: moment(obj.time)
      }
    )
  )
  res.send(temp);
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
  // console.log(message.toString())
  var stringBuf = message && message.toString('utf-8')
  try {
    var json = JSON.parse(stringBuf);
    console.log(json);
    // Add a post
    db.get('posts')
      .push({ id: uuid.v1(), temp: json.temperature_C, humidity: json.humidity, time: json.time })
      .write()
    db.update('count', n => n + 1)
      .write()
  } catch (e) {
    console.log(stringBuf);
  }

})

// Set a user using Lodash shorthand syntax
// db.set('user.name', 'typicode')
//   .write()


app.listen(3000, () => console.log('Gator app listening on port 3000!'));
