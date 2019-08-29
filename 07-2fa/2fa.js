const speakeasy = require('speakeasy')
const fs = require('fs')
const qrcodeTerminal = require('qrcode-terminal')


// Parse args
if (process.argv.includes('gen')) {
    // Generate
    const secret = speakeasy.generateSecret()

    console.log(secret)

    console.log(`base32: ${secret.base32}`)

    fs.writeFileSync('./b32.txt', secret.base32)

    qrcodeTerminal.generate(secret.otpauth_url, { small: true }, (data) => {
        console.log(data)
    })
} else if (process.argv.includes('auth')) {
    // Authenticate
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
} else {
    console.log(`Usage:
node index.js [command]
------------------------
commands:

gen: Generate a new 2FA code
auth: Test authentication of most recently generated 2FA code`)
}
