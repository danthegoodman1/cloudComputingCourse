# Lesson 4: Firestore <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->

- [NoSQL and Firestore](#nosql-and-firestore)
- [Getting your Access Keys](#getting-your-access-keys)
- [Listen for Real Time Updates](#listen-for-real-time-updates)

## NoSQL and Firestore

I always prefer NoSQL. IMHO, the people that look down upon NoSQL and say SQL is the best is usually because they are resistant to change. However I am here to tell you why I love NoSQL, and in particular, Firestore. To cut it short, since you can Google all of this, I love Firestore because you can listen for real time changes (websocket to the DB), set public access rules so authenticate devices can connect directly to certain areas of the database without needing a backend, awesome querying, the collection/document structure, and the UI that you can edit the DB in the Firebase console and the Google Cloud console.

## Getting your Access Keys

This is something you are going to need to do in all of your other GCP projects, so make sure you get this down before you continue.

You need to have a GCP project that you are going to use, we are using the GCP side of Firestore now instead of Firebase, it's a more unified platform.

Open your project in GCP console, and search for `Credentials` under `APIs & Services`

Next, click: `Create credentials > Service account key > Service account > New Service Account`, give it a name, role: `Project > Owner`, and create as a JSON. It will download a file. **Never upload this file anywhere, even git**, google will detect it (on Github at least), and auto invalidate it in the Project, really annoying. You will need to reference that key later in code.

## Listen for Real Time Updates

_[more documentation here](https://cloud.google.com/nodejs/docs/reference/firestore/1.3.x)_

Create an npm project, and install deps.: `npm i -s @google-cloud/firestore`, then we want to create an `index.js` file, and import Firestore and set up our credentials:

```js
const Firestore = require("@google-cloud/firestore")

const db = new Firestore({
    projectId: "[YOUR PROJECT ID]",
    keyFilename: "./keyFile.json"
})

// Setup real-time listener

db.collection("testCollection").doc("realTimeDoc").onSnapshot((docSnap) => {
    console.log(`Document data now: ${JSON.stringify(docSnap.data())}`)
})
```

Now head over to the Firestore UI in Google Cloud, and create a collection called `testCollection` and a document called `realTimeDoc` with any data. Run the file with `node index.js` and put that terminal window next to your Firestore UI. Make an update to the document you created, and you should watch that change printed out in real time in your terminal.

Pretty cool, right?

Now this is something to have server-side the way it's set up. But we can setup certain collections and documents to be publicly readable, or require authentication to read and/or write to, without interfacing with an API that we've made... even cooler. The way to accomplish this is with Firestore rules. To write rules, we need to use the Firebase console, or the Firebase cli. Let's look at some example rules:

Rule template:
```
service cloud.firestore {
  match /databases/{database}/documents {
    match /<some_path>/ {
      allow read, write: if <some_condition>;
    }
  }
}
```

Auth Required (read, write):
```
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth.uid != null;
    }
  }
}
```

Allow anyone to read/write **(NEVER USE THIS)**:
```
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Allow public read if document has `visibility` field with string value of `public`:
```
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow the user to read data if the document has the 'visibility'
    // field set to 'public'
    match /cities/{city} {
      allow read: if resource.data.visibility == 'public';
    }
  }
}
```
