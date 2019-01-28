const mqtt = require('mqtt')
const express = require('express');
const session = require('express-session');
const app = express();
const low = require('lowdb');
const moment = require('moment-timezone');
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json');
const db = low(adapter);
const uuid = require('uuid');
const serveStatic = require('serve-static');
const history = require('connect-history-api-fallback');
const url = require('url');

process.env.ROOT_URL = 'http://localhost:8080';
// process.env.ROOT_URL = 'https://tsh-server.herokuapp.com';

// define env variables
const home_url = process.env.ROOT_URL;
const mqttUrl = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883');
const port = process.env.PORT || 3000;

const client = mqtt.connect(mqttUrl);

let counter = 0;

// db.defaults({ posts: [], user: {}, count: 0 })
//   .write()


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", home_url);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(session({
  secret: 'sailor-moon',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Login endpoint
app.get('/login', function (req, res) {
  if (!req.query.username || !req.query.password) {
    res.send('login failed');
  } else if (req.query.username === "admin" && req.query.password === "tsh") {
    req.session.user = "admin";
    req.session.admin = true;
    req.session.authenticated = true;
    req.session.save();
    // console.log(req.session);
    res.send("login success!");
  } else {
    res.send('login failed');
  }
});

// Logout endpoint
app.get('/logout', function (req, res) {
  req.session.destroy();
  res.send("logout success!");
});


app.get('/deleteData', (req, res) => {
  if (req.session && req.session.authenticated) {
    try {
      db.get('posts')
        .remove()
        .write()
      db.update('count', 0)
        .write()
      res.end('Deleted data!');
    } catch (e) {
      res.send(e);
      console.error(e);
    }
  } else {
    return res.sendStatus(401);
  }


});

app.get('/api', (req, res) => {
  if (req.session && req.session.authenticated) {
    res.send(db.get('posts'));
  } else {
    return res.sendStatus(401);
  }

});

client.on('connect', function () {
  client.subscribe('home/rtl_433', function (err) {
    if (!err) {
      client.publish('home/rtl_433', 'New mqtt consumer')
    }
  })
})

fahrenheitToCelsius = (fahrenheit) => {
  var fTempVal = parseFloat(fahrenheit);
  var cTempVal = (fTempVal - 32) * (5 / 9);
  return (Math.round(cTempVal * 100) / 100);
}

client.on('message', function (topic, message) {
  console.log(counter);
  // message is Buffer
  var stringBuf = message && message.toString('utf-8')
  try {
    var json = JSON.parse(stringBuf);
    // console.log(json);
    if (json.model === 'inFactory sensor') {
      if (json.id === 91 || json.id === 32) {
        // catch my specific sensor model
        if (json.temperature_F && json.humidity) {
          counter = counter + 1;
          if (counter === 100) {
            // add data to lowdb
            const time = moment.utc(json.time).tz("Europe/Berlin");
            const formattedTime = time.format('YYYY-MM-DD HH:mm:ss');
            console.log('write post');
            db.get('posts')
              .push({ id: uuid.v1(), room: json.id, temp: fahrenheitToCelsius(json.temperature_F), humidity: json.humidity, time: formattedTime })
              .write()
            db.update('count', n => n + 1)
              .write()
            counter = 0;
          }
        }
      }
    }
  } catch (e) {
    console.error(stringBuf);
  }

})

app.use(history());
app.use(serveStatic(__dirname + '/dist/spa-mat'));
app.listen(port, () => console.log('App listening on port ', port));
