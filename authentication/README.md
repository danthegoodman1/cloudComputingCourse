# Authentication and Logins <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->
- [Summary](#summary)
- [Handling Logins](#handling-logins)
    - [Password Storage](#password-storage)
    - [OAuth and Using Other Accounts](#oauth-and-using-other-accounts)
    - [Third Party Auth](#third-party-auth)
- [Custom Auth](#custom-auth)

## Summary

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

npm i jsonwebtoken bcrypt express body-parser cors
```

This will get us setup to make a simple API with authentication. For the purposes of this module, we are just going to store the user documents inside of a variable in memory. This would normally be stored in a database.

We need to make an `index.js` file to start dropping code into:

```js
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const bodyParser = require('bodyParser')

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
