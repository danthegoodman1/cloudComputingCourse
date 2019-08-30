# Module 7: Security the Cloud:- 2FA <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->

- [Why 2FA?](#why-2fa)
- [Build your first 2FA app](#build-your-first-2fa-app)
- [Protect Something with it](#protect-something-with-it)

## Why 2FA?

We need 2FA for many reasons. People share passwords. Passwords get leaked. Databases get leaked. The list goes on. Good thing is the awesome people who designed the modern systems for 2FA have made it stupid easy to add in the protection that we need.

## Build your first 2FA app

We are going to be using the lovely language of Node.js for this. We need to install the `qrcode-terminal` and `speakeasy` packages for our terminal-style 2FA authenticator. It won't actually give us access to anything, but it will be a fundament PoC that will show how easy it is to determine if someone is giving us a correct 2FA code.

Create a file named `generate.js` file, and dump this in:

```js
const speakeasy = require('speakeasy')
const qrcodeTerminal = require('qrcode-terminal')
const fs = require('fs')

const secret = speakeasy.generateSecret()

fs.writeFileSync('./b32.txt', secret.base32)

qrcodeTerminal.generate(secret.otpauth_url, { small: true }, (data) => {
    console.log(data)
})
```

Can you tell me what we are doing here? Answer these questions:
- Why are we saving it as base32?
- Why are we writing it to a file?
- Why are we printing a QR code to the terminal?

Base32 happens to be a nice, easily printable format that's not too long of a string. We print it to a file as a basic form of persistent storage, and we use a QR code so you can scan it with something like Authy or Google Authenticator. Go ahead and use one of those apps to add that code.

Now we need to build a authenticator that checks whether the user has correct 2FA, so make a file called `auth.js` and drop this in:

```js
const fs = require('fs')
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})
readline.question(`Please enter your 2fa code: `, (code) => {
    const base32secret = fs.readFileSync('./b32.txt', {encoding: 'utf-8'})
    const verified = speakeasy.totp.verify({
        secret: base32secret,
        encoding: 'base32',
        token: code
    })
    console.log(verified)
    readline.close()
})
```

Now run this, provide it with your 2FA code from your authenticator app. Now you have yourself some 2FA baby.

## Protect Something with it

Now we actually are going to use 2FA to protect something. Let's protect an endpoint that contains some information. We will access this endpoint through a simple HTML web page.

First we need new dependencies to accept connections and parse JSON from the front end:

`npm i -s body-parser express`

```js
const app = require("express")() // Shorthanded
const speakeasy = require('speakeasy')
const fs = require('fs')
const bodyParser = require("body-parser")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
```

Now we need an endpoint that will send the initial webpage:

```js
app.get("/", (req, res) => { // Send the web page
    res.sendFile("./index.html", { root: __dirname })
})
```

Next we need to have a login endpoint that will accept incoming `POST` requests to login:

```js
app.post("/login", (req, res) => {
    const { username, password, twofa } = req.body
    if (!username || !password || !twofa) { // If missing info
        console.log("Missing info")
        res.status(400).send("Missing info")
        return
    }
    const thePass = "password" // Never hard code this, but we are not showing password security here...
    const theUser = "username"
    if (theUser === username && thePass === password) {
        const base32secret = fs.readFileSync('./b32.txt', {encoding: 'utf-8'})
        const verified = speakeasy.totp.verify({
            secret: base32secret,
            encoding: 'base32',
            token: twofa
        })
        if (verified) {
            res.send("This is the secret endpoint info!")
        } else {
            res.status(401).send("Unauthorized")
        }
    } else {
        res.status(401).send("Unauthorized")
    }
})
```

Finally, we need to listen for connections:

```js
app.listen(8080, () => {
    console.log("listening on 8080")
})
```

I'll let you build the html part, but here is the `POST` request that goes with the backend:

```js
fetch("/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        username,
        password,
        twofa
    })
})
.then((response) => {
    return response.text()
})
.then((response) => {
    document.write(response)
})
.catch((err) => {
    console.error(err)
})
```

Once you write the rest of the HTML, you should be able to "login" with your 2FA code and get the "secret endpoint info".

Now if you're interested in how you might show the QR code again, it's quite easy. Here is the object that is generated when you make a 2FA key:

```js
{ ascii: '&BMBKl7TzOct(S1)isZU<5kb2N:Mn@ha',
  hex: '26424d424b6c37547a4f63742853312969735a553c356b62324e3a4d6e406861',
  base32: 'EZBE2QSLNQ3VI6SPMN2CQUZRFFUXGWSVHQ2WWYRSJY5E23SANBQQ',
  otpauth_url: 'otpauth://totp/SecretKey?secret=EZBE2QSLNQ3VI6SPMN2CQUZRFFUXGWSVHQ2WWYRSJY5E23SANBQQ' }
```

_You can also see in this why we don't like using the ascii version..._

As you can see, the `otpath_url` is no more than the `base32` secret that we saved appended to `otpauth://totp/SecretKey?secret=`. So if you ever need to recreate that data to pass into a QR code generator, just use this string formatter:

```js
`otpauth://totp/SecretKey?secret=${base32Secret}`
```

You could also create your own by just base32 encoding 32 random printable characters.

**[Now let's move on to the next lesson]()**
