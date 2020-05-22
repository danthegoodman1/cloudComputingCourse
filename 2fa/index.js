const app = require("express")()
const speakeasy = require('speakeasy')
const fs = require('fs')
const bodyParser = require("body-parser")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.get("/", (req, res) => { // Send the web page
    res.sendFile("./index.html", { root: __dirname })
})

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

app.listen(8080, () => {
    console.log("listening on 8080")
})
