const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3')

const Sequelize = require('sequelize')
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  storage: './database.sqlite'
})

sequelize.authenticate()
  .then(() => {
    console.log('Connection to SQLite3 has been established successfully.')
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err)
  })

// Define a DB model
const User = sequelize.define('user', {
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: null
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  jsonwebtoken: {
    type: Sequelize.STRING,
    allowNull: true
  }
})

User.sync()
  .then(() => {
    return User.findAll()
  })
  .then(users => {
    // users.destroy({force: true}) // If we need to delete the DB entries later
    console.log(`\n\n${users.length} users in db\n\n`)
  })
  .catch((err) => {
    if (err.name === 'SequelizeUniqueConstraintError') {
      console.log('error')
      // This is how we handle sequelize errors
    }
    console.error(err)
  })

const app = express()
app.use(cors()) // Allow CORS
app.use(bodyParser.json()) // Automatically interpret JSON bodies for us

app.get('/', (req, res) => {
  console.log('I got a request')
  res.send('Hello world!')
})

app.post('/register', (req, res) => {
  console.log('register request')
  bcrypt.hash(req.body.password, 12, (err, hash) => {
    User.findOrCreate({
 where: { username: req.body.username },
defaults: {
      username: req.body.username,
      password: hash
    }
 })
      .then(([user, created]) => {
        if (!created) {
          res.send('User already exists!')
        } else {
          res.send('User created!')
        }
      })
  })
})

app.post('/login', (req, res) => {
  console.log('login request')
  bcrypt.hash(req.body.password, 12, (err, hash) => {
    User.findOne({
      where: {
        username: req.body.username
      }
    })
      .then((found) => {
        bcrypt.compare(req.body.password, found.password, (err, result) => {
          if (result) {
            found.jsonwebtoken = jwt.sign({
              username: found.username,
              id: found.id
            }, 'secretkey', {
              expiresIn: '3m'
            })
            console.log(found || 'User not found!')
            res.send(found || 'User not found!')
            found.update({
              jsonwebtoken: found.jsonwebtoken
            })
          } else {
            res.send('invalid username/password combo')
          }
        })
      })
      .catch((err) => {
        console.log(err)
        res.send('User not found!')
      })
  })
})

app.get('/protected', (req, res) => {
  const token = req.header('Authorization').split(' ')[1] // Authorization: Bearer token
  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) {
      if (err.name == 'TokenExpiredError') {
        res.send('JWT expired (fetch a new one!)')
      } else {
        res.send('Invalid JWT')
      }
    } else {
      console.log('Current', new Date().getTime())
      console.log(decoded)
      res.send('Authenticated!')
    }
  })
})

app.listen(8080, () => {
  console.log('Listening on port 8080!')
})
