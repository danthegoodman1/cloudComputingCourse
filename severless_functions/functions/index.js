const functions = require("firebase-functions")

// HTTPS Function

const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors({ origin: true })) // Allow cross-origin requests

app.get("/", (req, res) => {
    res.send("This is my serverless function!")
})

exports.testHTTP = functions.https.onRequest(app)

// Database Function

exports.dbReact = functions.firestore.document("{collection}/{document}").onCreate((docSnap, context) => {
    console.log(`A document named: ${context.params.document} in the collection: ${context.params.collection} was created with data: ${JSON.stringify(docSnap.data())}`)
    return 0
})
