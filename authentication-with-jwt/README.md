# Authentication with JWT <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->
- [Overview](#overview)
- [Handling Logins](#handling-logins)
    - [Password Storage](#password-storage)
    - [OAuth and Using Other Accounts](#oauth-and-using-other-accounts)
    - [Third Party Auth](#third-party-auth)
- [Custom Auth](#custom-auth)
- [Summary](#summary)
    - [Further Development](#further-development)

## Overview

Being able to securely login, and make the process of security simple is crucial to mass adoption of a product or platform. Have you ever been to a website where every time you reloaded or navigated you had to login again? How annoying is that?

In this module we'll build a proper way to handle username/password manually, as well as using other authentication modules to simplify and streamline the process.

In another module we'll also cover simple 2FA that can be easily integrated into the login process.

## Handling Logins

#### Password Storage

I can't fathom why so many companies refuse, or are ignorant of, the proper way to handle password storage. Salt and hash that mf with bcrypt please.

This should be obvious, **NEVER STORE PLAINTEXT PASSWORDS.** It's that simple.

#### OAuth and Using Other Accounts

I'm not a fan of using Github, Google, or anything else to login to another platform. Usually if I'm doing it, it's because I want to quickly see what a product's dashboard looks like before I bother typing in information, or I need to link that account to the other for some reason (CI/CD, etc.)

I think that logging in using another account is asking for trouble. Imagine if you logged into everything with your Google account, then your Google account gets stolen. Now your everything account is stolen.

You can make the argument that if the email account is stolen then the bad actors can go password reset everything, but that would take time and fire off a lot of notifications on your end, giving you time to react.

So, for the purpose of this module, we will not be covering OAuth and using other accounts to login to a platform. But, it's very easy to implement with solutions like PassportJS, Firebase Auth, Auth0, etc.

#### Third Party Auth

I love Firebase Auth, but it does have limitations. There are a certain amount of authentications you can do every day, and you are totally reliant on this service to be alive for your application to run. Now, it's reliability is always improving, but a single point of failure can be dangerous. That being said if you're not the next Twitter or Facebook, Firebase Auth is amazing and super easy to plug into any application.

## Custom Auth

But, we can also do everything custom, that can scale just as horizontally as everything else. We will be using JWTs, or JSON Web Token to achieve this. JWTs are amazing for authenticated requests. Not only do they allow a service to determine whether someone is currently authenticated, but they can also hold some basic information like email, names, UIDs, etc. in the JWT so that you don't have to do database queries for a very large amount of operations.

*See: [https://jwt.io/](https://jwt.io/) for more info on JWTs*

We are going to avoid as many third part libraries as possible (like passport), and use the bare metal technologies to implement our own authentication solution. Doing do correctly is just as convenient and secure as any other libraries for standard username/password login.

We are going to be using NodeJS, and the `jsonwebtoken` and `bcrypt` libraries. So create a folder, and run the following:

```
npm init -y

npm i jsonwebtoken bcrypt express body-parser cors sqlite3 sequelize
```

This will get us setup to make a simple API with authentication. For the purposes of this module, we are just going to store the user documents inside of am SQLite3 DB. This would normally be stored in a decentralized database.

We need to make an `index.js` file to start dropping code into:

```js
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
    allowNull: true,
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

app.listen(8080, () => {
  console.log('Listening on port 8080!')
})
```

Run this file and cURL, navigate in the browser, or make a postman GET request to `http://localhost:8080` to see `Hello world!`. If you do, you can move on.

*See this for more info on bcrypt hashing: [https://stackoverflow.com/questions/20394137/yii-cpasswordhelper-hashpassword-and-verifypassword/20399775#20399775](https://stackoverflow.com/questions/20394137/yii-cpasswordhelper-hashpassword-and-verifypassword/20399775#20399775)*

Remember the intro to virtual machine module where we made simple accounts using Express and SQlite3? This is going to be similar, but with auth.

Now we need to add a register route to make an account:

```js
app.post('/register', (req, res) => {
  console.log('register request')
  bcrypt.hash(req.body.password, 12, (err, hash) => { // Hash password
    // Check if user exists or needs to be registered
    User.findOrCreate({ where: {username: req.body.username }, defaults: {
      username: req.body.username,
      password: hash
    }})
    .then(([user, created]) => {
      if (!created) {
        res.send('User already exists!')
      } else {
        res.send('User created!')
      }
    })
  })
})
```

We also need to login and generate that jsonwebtoken:

```js
app.post('/login', (req, res) => {
  console.log('login request')
  bcrypt.hash(req.body.password, 12, (err, hash) => {
    User.findOne({
      where: {
        username: req.body.username
      }
    })
    .then((found) => {
      // Hash the password
      bcrypt.compare(req.body.password, found.password, (err, result) => {
        if (result) {
          // Create the JWT
          found.jsonwebtoken = jwt.sign({
            username: found.username,
            id: found.id
          }, 'secretkey', { // This secret key should be an env var
            expiresIn: '3m'
          })
          console.log(found || "User not found!")
          res.send(found || "User not found!")
        } else {
          res.send('invalid username/password combo')
        }
      })
    })
    .catch((err) => {
      console.log(err)
      res.send("User not found!")
    })
  })
})
```

This will create a token that expires in 3 minutes.

Now create this protected endpoint:

```js
app.get('/protected', (req, res) => { // Profile page, etc.
  const token = req.header('Authorization').split(' ')[1] // Authorization: Bearer token
  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) {
      if (err.name == 'TokenExpiredError') {
        res.send('JWT expired (fetch a new one!)')
      } else {
        res.send('Invalid JWT')
      }
    } else {
      console.log(decoded)
      res.send('Authenticated!')
    }
  })
})
```

We need to set a header like this in the request:

```js
"Authorization": `Bearer ${token}`
```

If you were within the 3 minutes, then you will be authenticated. If the token was incorrect, it will say invalid. If the token was expired, we'll be asked to login again.

## Summary

In this module, we created a register route and stored user information securely with bcrypt. We then created a login route, that generated a JWT holding basic information about the user, that eventually expired. We then created a protected route, that checked the validity of a JWT before responding to the request.

By using JWTs instead of repeatedly sending username/password combos every time we make a request, we greatly increase security and simplicity of a service.

#### Further Development

There is something wrong with our implementation, and it's only a 1 character difference (kind of)... an `s`! It's totally insecure to have any sort of password process served over `http`. In a real implementation, `https` should be the first thing you implement.

We could continue securing the service by adding in multi-factor authentication like rolling codes. We could also implement a refresh token feature which allows a user with a previously valid token to create a new valid token like OAuth2. However, this comes with certain vulnerabilities that greatly increase the risk in having a token stolen. Forcing someone to log back in is more secure, and it ensures they don't forget their login info!

*See: [https://www.npmjs.com/package/jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) for more on the `jsonwebtoken` library.*
