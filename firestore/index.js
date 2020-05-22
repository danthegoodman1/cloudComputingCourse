const Firestore = require("@google-cloud/firestore")

const db = new Firestore({
    projectId: "[YOUR PROJECT ID]",
    keyFilename: "./keyFile.json"
})

// Setup real-time listener

db.collection("testCollection").doc("realTimeDoc").onSnapshot((docSnap) => {
    console.log(`Document data now: ${JSON.stringify(docSnap.data())}`)
})
