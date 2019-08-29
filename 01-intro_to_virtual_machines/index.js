const express = require('express')

const app = express()

// BEGIN NEW CHUNK
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
    firstName: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
    },
    userName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    }
})

User.sync()
.then(() => {
    return User.findAll()
})
.then(users => {
    // users.destroy({force: true}) // If we need to delete the DB entries later
    console.log(`\n\n${users.length} users in db\n\n`)
    return User.findOrCreate({ where: { username: 'admin' }, defaults: { userName: 'admin', firstName: 'Dan', lastName: 'Goodman' } })
})
.then(([user, created]) => {
    if (created) {
        console.log('created the admin user')
    } else {
        console.log('admin user already existed')
    }
})
.catch((err) => {
    if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('error')
        // This is how we handle sequelize errors
    }
    console.error(err)
})

// END NEW CHUNK

app.get('/', (req, res) => {
    res.send("Hello World!")
})

app.get('/get/:username', (req, res) => {
    User.findOne({
        where: {
            username: req.params.username
        }
    })
    .then((found) => {
        console.log(found || "User not found!")
        res.send(found || "User not found!")
    })
    .catch((err) => {
        console.log(err)
        res.send("User not found!")
    })
})

app.get('/updateFirst/:username/:newFirst', (req, res) => {
    User.findOne({
        where: {
            username: req.params.username
        }
    })
    .then((found) => {
        return found.update({ firstName: req.params.newFirst })
    })
    .then(() => {
        console.log(`Updated to ${req.params.newFirst}`)
        res.send(`Updated to ${req.params.newFirst}`)
    })
    .catch((err) => {
        console.log(err)
        res.send("User not found!")
    })
})

app.get('/delete/:username', (req, res) => {
    User.findOne({
        where: {
            username: req.params.username
        }
    })
    .then((found) => {
        return found.destroy()
    })
    .then(() => {
        console.log(`deleted ${req.params.username}`)
        res.send(`deleted ${req.params.username}`)
    })
    .catch((err) => {
        console.log(err)
        res.send("User not found!")
    })
})

app.get('/create/:username/:firstName/:lastName', (req, res) => {
    const { username, firstName, lastName } = req.params
    User.findOrCreate({ where: { username }, defaults: { userName: username, firstName, lastName } })
    .then(([user, created]) => {
        if (created) {
            console.log(user)
            res.send(user)
        } else {
            res.send("Already exists")
            console.log("already exists")
        }
    })
})

app.listen(8280, () => {
    console.log("Running on port 8080")
})
