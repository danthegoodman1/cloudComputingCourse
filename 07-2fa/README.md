# Module 12: Security the Cloud: 2FA <!-- omit in toc -->

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

Now we actually are going to use 2FA to protect something. Let's protect an endpoint that contains some information. We will access this endpoint through a simple HTML web page. So first we need to build some endpoints in our web app. First let's make thew `/` endpoint that will load the initial web page:

```js
app.get("/", (req, res) => {
    
})
```
