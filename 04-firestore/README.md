# Lesson 4: Firestore and NoSQL Data Modeling <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->

- [NoSQL and Firestore](#nosql-and-firestore)
- [Getting your Access Keys](#getting-your-access-keys)
- [Listen for Real Time Updates](#listen-for-real-time-updates)
- [Querying](#querying)
- [Advanced Querying and Data Modeling](#advanced-querying-and-data-modeling)

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

This is a very complex process, and this part is less related to cloud computing and more to developing a front end, so I'll just drop some links here:

https://cloud.google.com/firestore/docs/security/get-started
https://cloud.google.com/firestore/docs/security/rules-conditions

## Querying

Another awesome feature of Firestore is it's advanced querying capabilities. Let's look at a basic query:

```js
db.collection("someCollection").where("someField", ">=", "someValue").get()
```

This will return a Query Reference, which is essentially an array of Document References that apply to the query.

We can also compound queries:

```js
db.collection("someCollection").where("someField", ">", "aSmallValue").where("someField", "<", "aBigValue").get()
```

Now we will get all values between the ones we specified. What's cool is this also works for JS datetime objects, or Firestore timestamp objects if you need to query by time.

Firestore can also query looking into the fields of document by some other really useful methods, like the ArrayContains method:

```js
db.collection("someCollection").where("someArray", "array-contains", "someValue").get()
```

This query will return what documents have an array called `someArray` that has the string `someValue` in it. Pretty neat.

We can also query keys inside of a map (object) inside of a document like so:

```js
db.collection("someCollection").where("someMap.key", "==", 45).get()
```

This will return any documents that have a `someMap` object with a key of `key` that has the value `45`.

## Advanced Querying and Data Modeling

It's gets better.

What if we wanted to model a tree in Firestore? Well we can query a tree using the power of Unicode values. Here is a diagram of the tree, this will make sense as we go:

![diagram-tree](/assets/diagram-tree.png)

All of the Letters are a document under the same collection, we will call `tree` in Firestore, like so:

![Screen Shot 2019-08-23 at 10.39.20 AM](/assets/Screen%20Shot%202019-08-23%20at%2010.39.20%20AM.png)

Notice the `parent` field. For B, the parent field is `A`, for C and D, the parent field is `AB`.

We can now query it.

We can get the root of the tree by querying where `parent == false`:

```js
const root = db.collection("tree").where("parent", "==", false).get()
```

Then we can get the direct children of a level in the tree by making a compound query based on the Unicode values, so let's write a re-usable function to handle this for us:

```js
const getChildren = (parentID) => {
    return db.collection("tree")
        .where("parent", ">=", parentID)
        .where("parent", "<=", `${parentID}~`)
        .get()
}

getChildren(root.id)
```

This will get us all of the children of the root: `A`, which should return `B`, `C`, and `D`. This works because of how JS compares strings and Unicode values. If you wanted to only query a certain level of the tree, then you would want to add in an additional document field called `level` that you can query to get children of a certain level.

Say we only wanted the 3rd level down of the tree. Assuming the level of the root is `0`:

```js
db.collection("tree")
    .where("parent", ">=", parentID)
    .where("parent", "<=", `${parentID}~`)
    .where("level", "==", 2)
    .get()
```

This query will return the 3rd level (index 2) of the tree.

Pretty awesome right?

This is essentially how geo-querying works. I won't go into that because it is a gross oversimplification of a very complicated topic, but this structure and querying technique is the foundation for many very advanced technologies.

**[Let's move on to the next lesson]()**
