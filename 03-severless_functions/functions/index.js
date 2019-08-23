const functions = require('firebase-functions')
const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors({ origin: true })) // Allow cross-origin requests

app.get("/", (req, res) => {
    res.send("This is my serverless function!")
})

exports.testHTTP = functions.https.onRequest(app)
