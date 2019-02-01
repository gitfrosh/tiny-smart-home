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
// const jsonexport = require('jsonexport');
const fs = require('fs');
const Pool = require('pg').Pool;
var copyTo = require('pg-copy-streams').to;

// IMPORTANT: change before deployment
// process.env.ROOT_URL = 'http://localhost:8080';
process.env.ROOT_URL = 'https://tsh-server.herokuapp.com';

// define env variables
const home_url = process.env.ROOT_URL;
const mqttUrl = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883');
const port = process.env.PORT || 3000;
// const postgres_url = process.env.DATABASE_URL || 'postgres://localhost:5432/tsh';

// setup posgresql db connection
let pool;
if (process.env.ROOT_URL === 'http://localhost:8080') {
  try {
    pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'tsh',
      password: 'password',
      port: 5432,
    })
    pool.query("CREATE TABLE IF NOT EXISTS posts (id VARCHAR(100) PRIMARY KEY, room INT, temp VARCHAR(30), humidity VARCHAR(30), time VARCHAR(100))");
  } catch (e) {
    console.log(e)
  }
} else {
  // connect to heroku on prod mode
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    });
    pool.query("CREATE TABLE IF NOT EXISTS posts (id VARCHAR(100) PRIMARY KEY, room INT, temp VARCHAR(30), humidity VARCHAR(30), time VARCHAR(100))");
    console.log('connected to postgresql on heroku')
  } catch (e) {
    console.log(e)
  }
}

const client = mqtt.connect(mqttUrl);

let counter = 0;

db.defaults({ posts: [], user: {} })
  .write()


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

// download CSV
app.get('/download', function (req, res) {
  try {
    // lowdb implementation
    // var reader = fs.createReadStream('db.json');
    var writer = fs.createWriteStream('db.csv');
    // var pipe = reader.pipe(jsonexport()).pipe(writer);

    pool.connect(function (pgErr, client, done) {
      var stream = client.query(copyTo('COPY posts TO STDOUT'));
      var pipe = stream.pipe(writer);
      pipe.on('finish', function () {
        var stream = fs.createReadStream('db.csv');
        res.attachment('db.csv');
        stream.pipe(res);
      });
    })

  } catch (e) {
    console.log(e)
  }
});

app.get('/deleteData', (req, res) => {
  if (req.session && req.session.authenticated) {
    try {
      // db.get('posts')
      //   .remove()
      //   .write()
      pool.query("TRUNCATE TABLE posts");
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
    // implementation for lowdb
    // res.send(db.get('posts'));
    pool.query('SELECT * FROM posts', (error, results) => {
      if (error) {
        throw error
      }
      res.status(200).json(results.rows)
    })
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
            // implementation for lowdb
            // db.get('posts')
            //   .push({ id: uuid.v1(), room: json.id, temp: fahrenheitToCelsius(json.temperature_F), humidity: json.humidity, time: formattedTime })
            //   .write()
            pool.query('INSERT INTO posts (id, room, temp, humidity, time) VALUES ($1, $2, $3, $4, $5)', [uuid.v1(), json.id, fahrenheitToCelsius(json.temperature_F), json.humidity, formattedTime], (error, results) => {
              if (error) {
                throw error
              } else {
                // console.log(results);
              }
            })
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
